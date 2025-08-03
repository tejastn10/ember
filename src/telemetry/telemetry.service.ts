import { Injectable, Logger } from "@nestjs/common";
import * as promClient from "prom-client";

@Injectable()
export class TelemetryService {
	private readonly logger = new Logger(TelemetryService.name);
	public readonly register: promClient.Registry;

	constructor() {
		this.register = new promClient.Registry();
		promClient.collectDefaultMetrics({ register: this.register });
		this.logger.log("Prometheus metrics registry initialized");
	}
}
