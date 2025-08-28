import { Controller, Get, HttpException, Logger, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	type DiskHealthIndicator,
	HealthCheck,
	type HealthCheckResult,
	type HealthCheckService,
	type HealthIndicatorResult,
	type MemoryHealthIndicator,
	type TypeOrmHealthIndicator,
} from "@nestjs/terminus";
import { trace } from "@opentelemetry/api";
import type { FastifyReply } from "fastify";

import { ResponseMessage, ResponseStatus } from "./common/enum/response";
import type { TelemetryService } from "./telemetry/telemetry.service";

@ApiTags("Health")
@Controller()
export class AppController {
	constructor(
		private health: HealthCheckService,
		private memory: MemoryHealthIndicator,
		private disk: DiskHealthIndicator,
		private database: TypeOrmHealthIndicator,
		private telemetry: TelemetryService
	) {}

	private readonly logger = new Logger("Main");

	@Get()
	@ApiOperation({
		summary: "Check if server is running",
		description: "This endpoint is used to verify whether the server is currently running.",
	})
	main(): string {
		// Create a manual trace to test OpenTelemetry
		const tracer = trace.getTracer("ember-test");
		const span = tracer.startSpan("manual-test-span");

		span.setAttributes({
			"test.manual": true,
			"test.endpoint": "/",
			"test.timestamp": Date.now(),
		});

		this.logger.log("Manual span created for testing");

		span.end();
		return "Server running";
	}

	@Get("health")
	@ApiOperation({
		summary: "Get server health status",
		description:
			"This endpoint retrieves the health status of the server, indicating whether it is operating normally or if there are any issues that need attention.",
	})
	@HealthCheck()
	async check(): Promise<HealthCheckResult> {
		try {
			const result = await this.health.check([
				async (): Promise<HealthIndicatorResult> =>
					this.memory.checkHeap("memory_heap", 150 * 1024 * 1024), // Check memory usage
				async (): Promise<HealthIndicatorResult> =>
					this.disk.checkStorage("disk_storage", { thresholdPercent: 0.5, path: "/" }), // Check disk usage
				async (): Promise<HealthIndicatorResult> =>
					this.database.pingCheck("database", { timeout: 300 }), // Check database connection
			]);

			// If any individual health check fails, throw an error
			Object.values(result.details).forEach((detail) => {
				if (detail.status !== "up") {
					throw new HttpException(
						ResponseMessage.SERVICE_UNAVAILABLE,
						ResponseStatus.SERVICE_UNAVAILABLE
					);
				}
			});

			return result;
		} catch (error) {
			this.logger.error(`An error occurred while checking health ${error.message}`);

			throw new HttpException(
				error.message === ResponseMessage.SERVICE_UNAVAILABLE
					? ResponseMessage.SERVICE_UNAVAILABLE
					: ResponseMessage.I_AM_A_TEAPOT,
				error.message === ResponseMessage.SERVICE_UNAVAILABLE
					? ResponseStatus.SERVICE_UNAVAILABLE
					: ResponseStatus.I_AM_A_TEAPOT
			);
		}
	}

	@Get("metrics")
	@ApiOperation({
		summary: "Prometheus metrics endpoint",
		description:
			"This endpoint provides Prometheus-compatible metrics for monitoring and observability.",
	})
	async metrics(@Res() res: FastifyReply): Promise<void> {
		try {
			const metrics = await this.telemetry.register.metrics();
			res.type("text/plain").send(metrics);
		} catch (error) {
			this.logger.error(`Error generating metrics: ${error.message}`);
			res.status(500).send("Error generating metrics");
		}
	}

	// Error scenario endpoints for testing observability
	@Get("test-errors/database")
	@ApiOperation({
		summary: "Test database connection error",
		description: "Simulates a database connection error for testing tracing and logging.",
	})
	async testDatabaseError(): Promise<never> {
		this.logger.error("Simulated database connection error");
		throw new HttpException("Database connection failed", ResponseStatus.SERVICE_UNAVAILABLE);
	}

	@Get("test-errors/timeout")
	@ApiOperation({
		summary: "Test timeout error",
		description: "Simulates a timeout error for testing async operations in traces.",
	})
	async testTimeoutError(): Promise<never> {
		this.logger.warn("Starting long operation that will timeout");
		await new Promise((_, reject) =>
			setTimeout(() => {
				this.logger.error("Operation timed out");
				reject(new Error("Operation timed out after 5 seconds"));
			}, 5000)
		);
		throw new HttpException("Operation timed out", ResponseStatus.REQUEST_TIMEOUT);
	}

	@Get("test-errors/http")
	@ApiOperation({
		summary: "Test HTTP client error",
		description: "Simulates an HTTP client error for testing external service calls.",
	})
	async testHttpError(): Promise<never> {
		this.logger.error("External service call failed");
		throw new HttpException("External service returned 500", ResponseStatus.BAD_GATEWAY);
	}

	@Get("test-errors/memory")
	@ApiOperation({
		summary: "Test memory error",
		description: "Simulates a memory allocation error for testing resource monitoring.",
	})
	async testMemoryError(): Promise<never> {
		this.logger.error("Memory allocation failed");
		throw new HttpException("Insufficient memory", ResponseStatus.INTERNAL_SERVER_ERROR);
	}

	@Get("test-errors/unhandled")
	@ApiOperation({
		summary: "Test unhandled exception",
		description: "Throws an unhandled exception for testing error handling.",
	})
	async testUnhandledException(): Promise<never> {
		this.logger.error("Unhandled exception occurred");
		throw new Error("This is an unhandled exception for testing");
	}
}
