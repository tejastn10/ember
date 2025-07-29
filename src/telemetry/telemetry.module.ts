import { Module, Global } from "@nestjs/common";

import { TelemetryService } from "./telemetry.service";

@Global()
@Module({
	providers: [TelemetryService],
	exports: [TelemetryService],
})
export class TelemetryModule {}
