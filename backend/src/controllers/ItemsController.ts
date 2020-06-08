import { Request, Response } from 'express';

import knex from '../database/connection';

interface IItemsController {
    index: any
}

function createItemsController(): IItemsController {
    async function index(req: Request, res: Response) {
        try {
            const items = await knex('items').select('*');

            const HOST = `${req.protocol}://${req.get('host')}`;

            const serializedItems = items.map((item) => ({
                ...item,
                image_url: `${HOST}/uploads/${item.image}`,
            }));

            return res.send({ items: serializedItems });
        } catch (error) {
            return res.status(400).send({ error: 'Unnable to list items' });
        }
    }

    return {
        index,
    };
}

export default createItemsController;
