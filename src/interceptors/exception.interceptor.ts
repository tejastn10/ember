import {
	type CallHandler,
	type ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
	Logger,
	type NestInterceptor,
} from "@nestjs/common";

import { type Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
	private readonly logger = new Logger(ExceptionInterceptor.name);

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const handler = context.getHandler();
		const controller = context.getClass();
		const request = context.switchToHttp().getRequest();

		return next.handle().pipe(
			catchError((err: unknown) => {
				// Log the error with additional context information
				this.logger.error(
					`Error occurred in ${controller.name} - ${handler.name}. Request details: ${JSON.stringify(
						{
							method: request.method,
							url: request.url,
						},
						null,
						2
					)}. Error: ${err instanceof Error ? err.message : err}`
				);
				this.logger.error(`Error stack: ${err instanceof Error ? err.stack : undefined}`);

				// Check the type of the error and handle accordingly
				if (err instanceof HttpException) {
					// If it's an HTTP error, propagate the message and status
					return throwError(() => new HttpException(err.message, err.getStatus()));
				}

				// Handle unexpected errors
				return throwError(
					() => new HttpException("Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR)
				);
			})
		);
	}
}
