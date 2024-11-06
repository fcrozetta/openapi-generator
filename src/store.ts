import { writable, get } from 'svelte/store';
import type { Endpoint } from './types';

export const endpoints = writable<Endpoint[]>([]);
export const globalTags = writable<string[]>([]);

export function generateOpenApiSpec() {
	const spec = {
		openapi: '3.0.0',
		info: {
			title: 'API',
			version: '1.0.0'
		},
		tags: get(globalTags).map((tag) => ({ name: tag })),
		paths: {} as Record<string, any>
	};

	const items = get(endpoints);

	items.forEach(({ method, url, headers, inputExample, responses, tags }) => {
		if (!spec.paths[url]) {
			spec.paths[url] = {};
		}

		// Structure for the method with all its responses
		const methodStructure: Record<string, any> = {
			tags,
			responses: {}
		};

		// Only include the requestBody for methods that support it
		if (['post', 'put', 'patch', 'delete'].includes(method.toLowerCase()) && inputExample) {
			methodStructure.requestBody = {
				content: {
					'application/json': {
						example: JSON.parse(inputExample)
					}
				}
			};
		}

		// Add each response to the method structure
		responses.forEach(({ responseCode, responseDescription, outputExample }) => {
			methodStructure.responses[responseCode] = {
				description: responseDescription,
				content: {
					'application/json': {
						example: outputExample ? JSON.parse(outputExample) : {}
					}
				}
			};
		});

		// Set the method-specific data under the HTTP method (e.g., "get", "post")
		spec.paths[url][method.toLowerCase()] = methodStructure;
	});

	return spec;
}
