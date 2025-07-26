import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";

import helmet from "@fastify/helmet";

import { ExceptionInterceptor } from "./interceptors/exception.interceptor";

import {
	CorsOptions,
	NestOptions,
	HelmetOptions,
	SwaggerOptions,
	VersioningOptions,
	ValidationPipeOptions,
} from "./options";

import { AppModule } from "./app.module";

import { ConfigModule } from "./config/config.module";
import { SwaggerModule } from "./docs/swagger/swagger.module";

import { ConfigService } from "./config/config.service";
import { SwaggerService } from "./docs/swagger/swagger.service";

const bootstrap = async (): Promise<void> => {
	const FastifyModule = new FastifyAdapter();

	const isProduction = process.env.ENV === "Production";

	// * Security configurations
	if (isProduction) {
		FastifyModule.register(helmet, HelmetOptions);
	} else {
		Logger.warn("Running without Helmet in non-production environment", "Security");
	}

	// * CORS configuration
	const corsConfig = isProduction
		? CorsOptions
		: {
				origin: true,
				credentials: true,
				// ? You might want to add other development-specific options here
			};

	FastifyModule.enableCors(corsConfig);

	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		FastifyModule,
		NestOptions
	);

	// Versioning
	app.enableVersioning(VersioningOptions);

	// Swagger implementation
	const swaggerService = app.select(SwaggerModule).get(SwaggerService);
	swaggerService.createDocument(app, SwaggerOptions);

	// Middlewares, Interceptors & Pipes
	app.useGlobalPipes(new ValidationPipe(ValidationPipeOptions));
	app.useGlobalInterceptors(new ExceptionInterceptor());

	// Config implementation
	const configService = app.select(ConfigModule).get(ConfigService);
	const MODE = configService.getString("MODE") || "DEV";
	const PORT = configService.getNumber("PORT") || 5000;
	const HOST = configService.getString("HOST") || "0.0.0.0";

	await app.listen(
		{
			port: PORT,
			host: HOST,
		},
		(error, address) => {
			if (error) {
				Logger.error(`Failed to start server: ${error.message}`, "Server");
				return;
			}

			Logger.verbose(`Server listening on port:${PORT}`, "SERVER");
			Logger.verbose(`IPv4: http://${HOST}:${PORT}`, "SERVER");
			Logger.verbose(`IPv6: ${address}`, "SERVER");

			Logger.debug(`Server running in ${MODE} mode`, "SERVER");
		}
	);
};

bootstrap();
