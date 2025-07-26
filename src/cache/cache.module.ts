import { Global, Module } from "@nestjs/common";

import { ConfigModule } from "../config/config.module";

import { RedisService } from "./redis/redis.service";

@Global()
@Module({
	imports: [ConfigModule],
	providers: [RedisService],
	exports: [RedisService],
})
export class CacheModule {}
