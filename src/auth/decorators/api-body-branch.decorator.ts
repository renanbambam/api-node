import { applyDecorators } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

export function ApiBodyBranch(required?: string[] | []) {
    return applyDecorators(
        ApiBody({
            schema: {
                type: 'object',
                required: required,
                properties: {
                    name: {
                        type: 'string',
                    },
                    email: {
                        type: 'string',
                    },
                    address: {
                        type: 'string',
                    },
                    addresNumber: {
                        type: 'string',
                    },
                    city: {
                        type: 'string',
                    },
                    state: {
                        type: 'string',
                    },
                    country: {
                        type: 'string',
                    },
                    zipcode: {
                        type: 'string',
                    },
                    avatar: {
                        type: 'string',
                    },
                    document: {
                        type: 'string',
                    },
                    phone: {
                        type: 'string',
                    },
                    company_id: {
                        type: 'string',
                    },
                },
            },
        })
    );
}
