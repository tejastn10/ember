import { RequestMethod } from "@nestjs/common";

const RequestMiddlewareOptions = {
	path: "*",
	method: RequestMethod.ALL,
};

export { RequestMiddlewareOptions };
