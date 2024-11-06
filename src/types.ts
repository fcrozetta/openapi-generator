export interface Header {
	key: string;
	value: string;
}

export interface Response {
	responseCode: string;
	responseDescription: string;
	outputExample: string;
}

export interface Endpoint {
	method: string;
	url: string;
	headers: Header[];
	inputExample: string;
	responses: Response[]; // Updated to support multiple responses
	tags: string[];
}
