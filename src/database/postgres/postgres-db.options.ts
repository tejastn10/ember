import type { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { ConfigModule } from "../../config/config.module";
import { PostgresDBService } from "./postgres-db.service";

const PostgresOptions: TypeOrmModuleAsyncOptions = {
	imports: [ConfigModule],
	useClass: PostgresDBService,
};

export { PostgresOptions };
