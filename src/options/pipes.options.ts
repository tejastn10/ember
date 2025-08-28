import type { ValidationPipeOptions as Options } from "@nestjs/common";

const ValidationPipeOptions: Options = {
	whitelist: true,
	transform: true,
	stopAtFirstError: true,
	errorHttpStatusCode: 422,
	forbidNonWhitelisted: true,
	transformOptions: {
		enableImplicitConversion: true,
		exposeUnsetFields: true,
	},
};

export { ValidationPipeOptions };
