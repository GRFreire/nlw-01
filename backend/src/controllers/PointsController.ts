import { Request, Response } from 'express';

import knex from '../database/connection';

interface IPointsController {
    create: any,
    show: any,
    index: any
}

interface IPoints {
    image: string,
    name: string,
    email: string,
    whatsapp: string,
    latitude: number,
    longitude: number,
    city: string,
    uf: string
}

function createPointsController(): IPointsController {
    function serializePoints(req: Request, points: IPoints[]) {
        const HOST = `${req.protocol}://${req.get('host')}`;

        return points.map((point) => ({
            ...point,
            image_url: `${HOST}/uploads/${point.image}`,
        }));
    }

    async function index(req: Request, res: Response) {
        try {
            const { city, uf, items } = req.query;

            const parsedItems = String(items).split(',').map((item) => Number(item.trim()));

            const points = await knex('points')
                .join('point_items', 'points.id', '=', 'point_items.point_id')
                .whereIn('point_items.item_id', parsedItems)
                .where('city', String(city))
                .where('uf', String(uf))
                .distinct()
                .select('points.*');

            const serializedPoints = serializePoints(req, points);

            return res.send({ points: serializedPoints });
        } catch (error) {
            return res.status(400).send({ error: 'Unnable to show point' });
        }
    }

    async function show(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const point = await knex('points').where('id', id).first();

            if (!point) return res.status(400).send({ error: 'Point not found' });

            const items = await knex('items')
                .join('point_items', 'items.id', '=', 'point_items.item_id')
                .where('point_items.point_id', id)
                .select('items.title');

            const serializedPoint = serializePoints(req, [point]);

            return res.send({ point: serializedPoint[0], items });
        } catch (error) {
            return res.status(400).send({ error: 'Unnable to show point' });
        }
    }

    async function create(req: Request, res: Response) {
        const trx = await knex.transaction();
        try {
            const {
                name,
                email,
                whatsapp,
                latitude,
                longitude,
                city,
                uf,
                items,
            } = req.body;

            const point = {
                image: req.file.filename,
                name,
                email,
                whatsapp,
                latitude: Number(latitude),
                longitude: Number(longitude),
                city,
                uf,
            };

            const insertedIds = await trx('points').insert(point);

            const pointId = insertedIds[0];

            const pointItems = items
                .split(',')
                .map((item: string) => Number(item.trim()))
                .map((itemId: number) => ({
                    item_id: itemId,
                    point_id: pointId,
                }));

            await trx('point_items').insert(pointItems);

            const serializedPoint = serializePoints(req, [point]);

            await trx.commit();
            return res.send({ point: { ...serializedPoint[0], id: pointId } });
        } catch (error) {
            await trx.rollback();
            return res.status(400).send({ error: 'Unnable to create point' });
        }
    }

    return {
        create,
        show,
        index,
    };
}

export default createPointsController;
