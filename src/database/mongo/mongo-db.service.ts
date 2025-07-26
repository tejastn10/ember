import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { MongooseModuleOptions, MongooseOptionsFactory } from "@nestjs/mongoose";

import { ConfigService } from "../../config/config.service";
import { initializeDatabaseConnection } from "../database.connection";

@Injectable()
export class MongoDBService implements MongooseOptionsFactory, OnModuleInit {
	constructor(private readonly configService: ConfigService) {}

	private readonly logger = new Logger(MongoDBService.name);

	async onModuleInit(): Promise<void> {
		const options = this.createMongooseOptions();
		await initializeDatabaseConnection(options);
	}

	createMongooseOptions(): MongooseModuleOptions {
		const uri = this.configService.getString("MONGO_URL");
		const dbName = this.configService.getString("MONGO_DATABASE");
		const autoIndex = this.configService.getBoolean("MONGO_AUTO_INDEX") ?? false;

		// Connection timeout settings
		const serverSelectionTimeoutMS =
			this.configService.getNumber("MONGO_SERVER_SELECTION_TIMEOUT") || 5000;
		const socketTimeoutMS = this.configService.getNumber("MONGO_SOCKET_TIMEOUT") || 45000;
		const connectTimeoutMS = this.configService.getNumber("MONGO_CONNECT_TIMEOUT") || 10000;

		// Pool settings
		const maxPoolSize = this.configService.getNumber("MONGO_MAX_POOL_SIZE") || 10;
		const minPoolSize = this.configService.getNumber("MONGO_MIN_POOL_SIZE") || 5;
		const maxIdleTimeMS = this.configService.getNumber("MONGO_MAX_IDLE_TIME") || 30000;

		// Retry logic
		const retryWrites = this.configService.getBoolean("MONGO_RETRY_WRITES") ?? true;
		const retryReads = this.configService.getBoolean("MONGO_RETRY_READS") ?? true;

		if (!uri) {
			this.logger.error("MongoDB URL is not defined in environment variables.");
			throw new Error("MONGO_URL is required to establish a MongoDB connection.");
		}

		return {
			uri,
			dbName,
			autoIndex,
			serverSelectionTimeoutMS,
			socketTimeoutMS,
			connectTimeoutMS,
			maxPoolSize,
			minPoolSize,
			maxIdleTimeMS,
			retryWrites,
			retryReads,
		};
	}
}
