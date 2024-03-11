import { applyDecorators } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

export function ApiFile(fieldName = 'avatar', required = false) {
    return applyDecorators(
        ApiBody({
            schema: {
                type: 'object',
                required: required ? [fieldName] : [],
                properties: {
                    name: {
                        type: 'string',
                    },
                    email: {
                        type: 'string',
                    },
                    password: {
                        type: 'string',
                    },
                    address: {
                        type: 'string',
                    },
                    addressNumber: {
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
                    [fieldName]: {
                        type: 'string',
                        format: 'base64',
                    },
                    birthday: {
                        type: 'string',
                    },
                    document: {
                        type: 'string',
                    },
                    phone: {
                        type: 'string',
                    },
                    roles: {
                        type: 'string',
                    },
                    company_id: {
                        type: 'string',
                    },
                    branch_id: {
                        type: 'string | {}',
                    },
                },
            },
        })
    );
}
