import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";

import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

@Injectable()
export class TelemetryService implements OnModuleInit, OnModuleDestroy {
	private sdk: NodeSDK;
	private readonly logger = new Logger(TelemetryService.name);

	constructor() {}

	async onModuleInit(): Promise<void> {
		try {
			const traceExporter = new OTLPTraceExporter({
				url: "grpc://localhost:4317",
			});

			this.sdk = new NodeSDK({
				serviceName: "ember",
				traceExporter,
				instrumentations: [
					getNodeAutoInstrumentations({
						"@opentelemetry/instrumentation-http": { enabled: true },
						"@opentelemetry/instrumentation-express": { enabled: true },
						"@opentelemetry/instrumentation-nestjs-core": { enabled: true },
						"@opentelemetry/instrumentation-fs": { enabled: false },
					}),
				],
			});

			this.sdk.start();
			this.logger.log("LGTM telemetry started - traces going to Tempo");
		} catch (error) {
			this.logger.error("Failed to start telemetry:", error.message);
		}
	}

	async onModuleDestroy(): Promise<void> {
		try {
			if (this.sdk) {
				await this.sdk.shutdown();
				this.logger.log("Telemetry shut down");
			}
		} catch (error) {
			this.logger.error("Error shutting down telemetry:", error);
		}
	}
}
