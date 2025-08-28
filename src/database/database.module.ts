import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "../config/config.module";
import { MongoOptions } from "./mongo/mongo-db.options";
import { PostgresOptions } from "./postgres/postgres-db.options";

@Module({
	imports: [
		ConfigModule,

		TypeOrmModule.forRootAsync(PostgresOptions),

		MongooseModule.forRootAsync(MongoOptions),
	],
	controllers: [],
	providers: [],
	exports: [],
})
export class DatabaseModule {}
