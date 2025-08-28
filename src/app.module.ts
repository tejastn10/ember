import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { AppController } from "./app.controller";
import { CacheModule } from "./cache/cache.module";
import { ConfigModule } from "./config/config.module";
import { CoreModule } from "./core/core.module";
import { CruxModule } from "./crux/crux.module";
import { DatabaseModule } from "./database/database.module";
import { SwaggerModule } from "./docs/swagger/swagger.module";
import { RequestMiddleware } from "./middlewares/request.middleware";
import { RequestMiddlewareOptions } from "./options";
import { TelemetryModule } from "./telemetry/telemetry.module";

@Module({
	imports: [
		// Configs
		ConfigModule,
		SwaggerModule,
		TerminusModule,

		// Monitoring
		TelemetryModule,

		// Cache
		CacheModule,

		// Database
		DatabaseModule,

		// Main Modules
		CoreModule,
		CruxModule,
	],
	controllers: [AppController],
	providers: [],
	exports: [],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(RequestMiddleware).forRoutes(RequestMiddlewareOptions);
	}
}
