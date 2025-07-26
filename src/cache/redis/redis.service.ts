import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import RedisClient, { Redis } from "ioredis";

import { ConfigService } from "../../config/config.service";

import { DEFAULT_TTL_SECONDS } from "./constants";

@Injectable()
export class RedisService implements OnModuleInit {
	private readonly logger = new Logger(RedisService.name);
	private client: Redis;

	constructor(private readonly configService: ConfigService) {}

	async onModuleInit(): Promise<void> {
		this.logger.debug("Connecting to Redis...");

		const url = this.configService.getString("REDIS_URL");
		this.client = new RedisClient(url, {
			maxRetriesPerRequest: null,
			enableOfflineQueue: false,
			lazyConnect: false,
		});
		this.logger.verbose("Redis client is ready and connected.");
	}

	async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
		const ttl = ttlSeconds ?? DEFAULT_TTL_SECONDS;
		const data = typeof value === "object" ? JSON.stringify(value) : String(value);
		await this.client.set(key, data, "EX", ttl);
	}

	async get<T = unknown>(key: string): Promise<T | null> {
		const data = await this.client.get(key);
		if (!data) return null;
		try {
			return JSON.parse(data);
		} catch {
			return data as unknown as T;
		}
	}

	async del(key: string): Promise<number> {
		return this.client.del(key);
	}

	async exists(key: string): Promise<boolean> {
		return (await this.client.exists(key)) === 1;
	}

	async hset(hash: string, field: string, value: unknown): Promise<number> {
		const data = typeof value === "object" ? JSON.stringify(value) : String(value);
		return this.client.hset(hash, field, data);
	}

	async hget<T = unknown>(hash: string, field: string): Promise<T | null> {
		const data = await this.client.hget(hash, field);
		if (!data) return null;
		try {
			return JSON.parse(data);
		} catch {
			return data as unknown as T;
		}
	}

	async hdel(hash: string, field: string): Promise<number> {
		return this.client.hdel(hash, field);
	}

	async lpush(key: string, ...values: unknown[]): Promise<number> {
		const vals = values.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v))) as (
			| string
			| number
			| Buffer
		)[];
		return this.client.lpush(key, ...vals);
	}

	async lrange<T = unknown>(key: string, start = 0, stop = -1): Promise<T[]> {
		const items = await this.client.lrange(key, start, stop);
		return items.map((item) => {
			try {
				return JSON.parse(item);
			} catch {
				return item as unknown as T;
			}
		});
	}

	async sadd(key: string, ...members: unknown[]): Promise<number> {
		const vals = members.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v))) as (
			| string
			| number
			| Buffer
		)[];
		return this.client.sadd(key, ...vals);
	}

	async smembers<T = unknown>(key: string): Promise<T[]> {
		const members = await this.client.smembers(key);
		return members.map((m) => {
			try {
				return JSON.parse(m);
			} catch {
				return m as unknown as T;
			}
		});
	}

	async zadd(key: string, score: number, member: unknown): Promise<number> {
		const val = typeof member === "object" ? JSON.stringify(member) : String(member);
		return this.client.zadd(key, score, val);
	}

	async zrange<T = unknown>(key: string, start = 0, stop = -1): Promise<T[]> {
		const members = await this.client.zrange(key, start, stop);
		return members.map((m) => {
			try {
				return JSON.parse(m);
			} catch {
				return m as unknown as T;
			}
		});
	}

	async expire(key: string, ttlSeconds: number): Promise<number> {
		return this.client.expire(key, ttlSeconds);
	}

	async flushall(): Promise<string> {
		return this.client.flushall();
	}
}
