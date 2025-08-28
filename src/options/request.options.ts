import { RequestMethod } from "@nestjs/common";
import type { RouteInfo } from "@nestjs/common/interfaces";

const RequestMiddlewareOptions: RouteInfo = {
	path: "*",
	method: RequestMethod.ALL,
};

export { RequestMiddlewareOptions };
