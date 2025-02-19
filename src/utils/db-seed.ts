import path from 'path';
import prisma from './db-prisma';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import fs from 'fs';
import env from '../config/env';

const seedVehiclePlatforms = async () => {

    const platformsResolved = path.resolve(__dirname, './JSON/vehicle-platforms.json');

    const platformData = (JSON.parse(fs.readFileSync(platformsResolved, 'utf8'))).militaryVehiclePlatforms;

    await prisma.militaryVehiclePlatform.deleteMany();

    await Promise.all(platformData.map( async (platform: { name: string; description: string }) => {
        
        try {
            await prisma.militaryVehiclePlatform.upsert({
                create: {
                    id: randomUUID(),
                    name: platform.name,
                    description: platform.description,
                    href: ''
                },
                update: {},
                where: {
                    name: platform.name,
                },
            });

            console.log(`${platform.name} - Platform data seeded successfully!`);

        } catch (error) {
            console.error(`Error seeding Platform data. ${error}`);
        }

    }));
};

// seedVehiclePlatforms();

const seedStations = async () => {

    const stationsResolved = path.resolve(__dirname, './JSON/stations.json');
    
    const stationsData = (JSON.parse(fs.readFileSync(stationsResolved, 'utf8'))).stations;

    await prisma.station.deleteMany();
    
    await Promise.all(stationsData.map( async (station: { name: string; location: string; }) => {
        
        try {
            await prisma.station.upsert({
                create: {
                    id: randomUUID(),
                    name: station.name,
                    location: station.location,
                },
                update: {},
                where: {
                    name: station.name,
                },
            });

            console.log(`${station.name} - Station data seeded successfully!`);

        } catch (error) {
            console.error(`Error seeding Station data. ${error}`);
        }

    }));
};

// seedStations();

const seedUsers = async () => {

    const usersResolved = path.resolve(__dirname, './JSON/users.json');

    const usersData = (JSON.parse(fs.readFileSync(usersResolved, 'utf8'))).users;

    await prisma.user.deleteMany();

    await Promise.all(usersData.map( async (user: { username: any; stationName: string; password: string | Buffer<ArrayBufferLike>; fullName: any; email: string | null | undefined; role: any; rank: any, name: any; }) => {

        try {

            const station = await prisma.station.findUnique({
                where: {
                    name: user.stationName,
                }
            });

            if (station) {
                await prisma.user.upsert({
                    create: {
                        id: randomUUID(),
                        username: user.username,
                        hashedPassword: await bcrypt.hash(user.password, env.HASH_SALT_ROUNDS),
                        fullName: user.fullName,
                        email: user.email? user.email : null,
                        role: user.role,
                        rank: user.rank,
                        stationId: station.id,
                    },
                    update: {},
                    where: {
                        username: user.username
                    }
                });
                
                console.log(`${user.username} - User data seeded successfully!`);

            } else {
                console.error(`Something went wrong trying to find user station. ' => const station = ${station} '`);
            }
            

        } catch (error) {
            console.error(`Error seeding User data. ${error}`);
        }

    }));

};

// seedUsers();

const seedShelves = async () => {

    const shelvesResolved = path.resolve(__dirname, './JSON/shelves.json');

    const shelvesData = (JSON.parse(fs.readFileSync(shelvesResolved, 'utf8'))).shelves;

    await prisma.shelf.deleteMany();

    await Promise.all(shelvesData.map( async (shelf: { storeId: string; loc_row: number; loc_column: number; }) => {

        try {

            await prisma.shelf.upsert({
                where: {
                    id: randomUUID(),
                },
                update: {
                    storeId: shelf.storeId,
                    loc_row: shelf.loc_row,
                    loc_column: shelf.loc_column,
                },
                create: {
                    id: randomUUID(),
                    storeId: shelf.storeId,
                    loc_row: shelf.loc_row,
                    loc_column: shelf.loc_column,
                },
            });

            console.log(`${shelf.storeId} - Shelf data seeded successfully!`);

        } catch (error) {

            console.error(`Error seeding Shelf data. ${error}`);

        }

    }));
};

seedShelves();

// I'm configuring the seeding algorithm so that it just wipes all the data and we start
// Freshhh...

const seedItems = async () => {

    const itemsResolved = path.resolve(__dirname, './JSON/items.json');

    const forStoreData = async (itemsData: any, storeId: string) => {

        await prisma.item.deleteMany({
            where: {
                storeId: storeId
            }
        });
    
        // await Promise.all(itemsData.map( async (item: { storeId: string; name: string; unitOfMeasure: any; description: string; reorderPoint: number; }) => {
    
        //     try {
    
        //         await prisma.item.upsert({
        //             where: {
        //                 id: randomUUID(),
        //             },
        //             update: {
        //                 storeId: item.storeId,
        //                 name: item.name,
        //                 unitOfMeasure: item.unitOfMeasure,
        //                 description: item.description,
        //                 reorderPoint: item.reorderPoint,
        //             },
        //             create: {
        //                 id: randomUUID(),
        //                 storeId: item.storeId,
        //                 name: item.name,
        //                 unitOfMeasure: item.unitOfMeasure,
        //                 description: item.description,
        //                 reorderPoint: item.reorderPoint,
        //             }
        //         });
    
        //         console.log(`${item.name} - Item data seeded successfully!`);
                
        //     } catch (error) {
    
        //         console.error(`Error seeding Item data. ${error}`);
    
        //     }
    
        // }));

    }

    await forStoreData((JSON.parse(fs.readFileSync(itemsResolved, "utf8"))).ratelmk3, '0e448cee-cbd0-4a1f-86ae-2bb64d8ce2a0');
    console.log('Successfully erased (and reseeded) all Ratel MK3 item records!');

    await forStoreData((JSON.parse(fs.readFileSync(itemsResolved, "utf8"))).arma8x8, '4358d44d-2606-49c5-bf59-930e93af57b7');
    console.log('Successfully erased (and reseeded) all Arma 8x8 item records!');

    await forStoreData((JSON.parse(fs.readFileSync(itemsResolved, "utf8"))).mcave001, '84b94d22-d130-4d17-90d5-2dc549af720b');
    console.log('Successfully erased (and reseeded) all MCAVE 001 item records!');

    await forStoreData((JSON.parse(fs.readFileSync(itemsResolved, "utf8"))).tank5455, 'a4f79c96-ec33-42b3-af9a-e1ebcf395e02');
    console.log('Successfully erased (and reseeded) all Tank - 54/55 item records!');

    await forStoreData((JSON.parse(fs.readFileSync(itemsResolved, "utf8"))).rg31Nyala, 'b8eecb78-08b9-4340-b9fc-20d837d13b5c');
    console.log('Successfully erased (and reseeded) all RG - 31 Nyala item records!');

    await forStoreData((JSON.parse(fs.readFileSync(itemsResolved, "utf8"))).cobra1, 'bd1716b4-e2f9-4b48-b1e2-09f8302dddaf');
    console.log('Successfully erased (and reseeded) all Cobra 1 item records!');

    await forStoreData((JSON.parse(fs.readFileSync(itemsResolved, "utf8"))).cobra2, 'ea3ea430-0834-45c1-9dde-9583cbca64fd');
    console.log('Successfully erased (and reseeded) all Cobra 2 item records!');

};

seedItems();

const seedInventory = async () => {

    try {

        await prisma.inventory.deleteMany();
        await prisma.replenishmentLog.deleteMany();
        await prisma.outboundMovementLog.deleteMany();
        await prisma.transactionalRecordLog.deleteMany();
        console.log('Successfully erased all Inventory records!');
        console.log('Successfully erased all Suppply Log records!');
        console.log('Successfully erased all Replenishment Log records!');
        console.log('Successfully erased all Transactional Log records!');

        // const stores = await prisma.store.findMany();

        // for (const store of stores) {

        //     const shelves = await prisma.shelf.findMany({ where: { storeId: store.id } });

        //     const items = await prisma.item.findMany({
        //         where: {
        //             storeId: store.id,
        //         }
        //     });

        //     const usedStoreItems = new Set();
        //     const assignedItems = new Set(); // Track used items to avoid duplicates

        //     for (const shelf of shelves) {
                
        //         for (let row = 1; row <= shelf.numberOfRows; ++row) {
                    
        //             for (let col = 1; col <= shelf.numberOfColumns; ++col) {
                        
        //                 let randomItem;
                        
        //                 // Keep picking a random item until we get one that hasn't been used on this shelf
        //                 do {
        //                     randomItem = items[Math.floor(Math.random() * items.length)];
        //                 } while ((assignedItems.has(randomItem.id) || usedStoreItems.has(randomItem.id)) && assignedItems.size < items.length && usedStoreItems.size < items.length);

        //                 if (usedStoreItems.has(randomItem.id)) {
        //                     console.log(` ** Skipping assignment for ${randomItem.name} as it's already used across the store.`);
        //                     continue;
        //                 }

        //                 assignedItems.add(randomItem.id);
        //                 usedStoreItems.add(randomItem.id);

        //                 await prisma.inventory.create({
        //                     data: {
        //                         id: randomUUID(),
        //                         itemId: randomItem.id,
        //                         shelfId: shelf.id,
        //                         loc_row: row,
        //                         loc_column: col,
        //                         quantity: randomItem.reorderPoint * 10,
        //                     },
        //                 });
    
        //                 await prisma.replenishmentLog.upsert({
        //                     where: {
        //                         id: randomUUID(),
        //                     },
        //                     update: {},
        //                     create: {
        //                         id: randomUUID(),
        //                         userId: (await prisma.user.findUnique({where: {username: 'hydra 093'}}))!.id,
        //                         itemId: randomItem.id,
        //                         quantityReplenished: (Math.floor((Math.random() * randomItem.reorderPoint)) * 5.5),
        //                         reason: 'System Test',
        //                     }
        //                 });

        //                 await prisma.transactionalRecordLog.upsert({
        //                     where: {
        //                         id: randomUUID(),
        //                     },
        //                     update: {},
        //                     create: {
        //                         id: randomUUID(),
        //                         logType: 'RPL',
        //                         logDetails: 'System Test',
        //                         userId: (await prisma.user.findUnique({where: {username: 'hydra 093'}}))!.id,
        //                     }
        //                 });

        //                 console.log(`${randomItem.name} - Item data seeded successfully!`);

        //             }

        //         }

        //     }

        // }

    } catch (error) {

        console.error(`Error seeding Item data. ${error}`);
        
    }

};

seedInventory();