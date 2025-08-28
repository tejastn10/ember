import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

// Telemetry Configuration - Environment variables only (no NestJS ConfigService available yet)
const config = {
	serviceName: process.env.OTEL_SERVICE_NAME || "ember",
	logLevel: process.env.OTEL_LOG_LEVEL || "info",
	traceEndpoint:
		process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
		(process.env.NODE_ENV === "production"
			? "http://tempo:4318/v1/traces"
			: "http://localhost:4318/v1/traces"),
	isDevelopment: process.env.NODE_ENV !== "production",
};

// Enable OpenTelemetry debugging
process.env.OTEL_LOG_LEVEL = config.logLevel;

// Initialize OpenTelemetry before any other code runs
const traceExporter = new OTLPTraceExporter({
	url: config.traceEndpoint,
	headers: {
		"Content-Type": "application/json",
	},
	keepAlive: true,
	httpAgentOptions: {
		keepAlive: true,
	},
});

// Note: Metrics are handled by Prometheus scraping /metrics endpoint (not OTLP push)

// Create a batch span processor optimized for development or production
const spanProcessor = new BatchSpanProcessor(traceExporter, {
	maxExportBatchSize: config.isDevelopment ? 1 : 512, // Immediate export for dev
	exportTimeoutMillis: 10000,
	scheduledDelayMillis: config.isDevelopment ? 500 : 5000, // Faster exports for dev
	maxQueueSize: config.isDevelopment ? 100 : 2048,
});

const sdk = new NodeSDK({
	serviceName: config.serviceName,
	spanProcessor: spanProcessor,
	// Note: No metricReader - metrics are exposed via Prometheus format at /metrics endpoint
	instrumentations: [
		getNodeAutoInstrumentations({
			"@opentelemetry/instrumentation-http": { enabled: true },
			"@opentelemetry/instrumentation-express": { enabled: true },
			"@opentelemetry/instrumentation-nestjs-core": { enabled: true },
			"@opentelemetry/instrumentation-fs": { enabled: false },
			// Additional instrumentations can be controlled via env vars
			"@opentelemetry/instrumentation-redis": {
				enabled: process.env.OTEL_INSTRUMENT_REDIS !== "false",
			},
		}),
	],
});

// Start the SDK before importing any instrumented modules
sdk.start();

console.log("[TELEMETRY] OpenTelemetry started successfully");
console.log(`[TELEMETRY] Service: ${config.serviceName}`);
console.log(`[TELEMETRY] Traces: ${config.traceEndpoint}`);
console.log("[TELEMETRY] Metrics: Prometheus scraping /metrics endpoint");
console.log(`[TELEMETRY] Mode: ${config.isDevelopment ? "Development" : "Production"}`);

// Export for graceful shutdown
export { sdk };
