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

        await Promise.all(platformData.map( async (platform: { name: string; description: string, href: string }) => {
            
            try {
                await prisma.militaryVehiclePlatform.upsert({
                    create: {
                        id: randomUUID(),
                        name: platform.name,
                        description: platform.description,
                        href: platform.href,
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

    const seedStores = async () => {

        const stations = await prisma.station.findMany();

        const platforms = await prisma.militaryVehiclePlatform.findMany();

        await prisma.store.deleteMany();
        
        for (const station of stations) {

            for (const platform of platforms) {

                try {
                    await prisma.store.upsert({
                        create: {
                            id: randomUUID(),
                            platformId: platform.id,
                            stationId: station.id,
                            numberOfRows: 3,
                            numberOfColumns: 2
                        },
                        update: {},
                        where: {
                            stationId_platformId: {
                                platformId: platform.id,
                                stationId: station.id,
                            }
                        },
                    });

                    console.log(`${platform.name} - Store data seeded successfully!`);

                } catch (error) {
                    console.error(`Error seeding Store data. ${error}`);
                }

            }

        }

    };

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

    const seedShelves = async () => {

        const shelvesResolved = path.resolve(__dirname, './JSON/shelves.json');

        const shelvesData = (JSON.parse(fs.readFileSync(shelvesResolved, 'utf8'))).shelves;

        await prisma.shelf.deleteMany();

        await Promise.all(shelvesData.map( async (shelf: { platformName: string; loc_row: number; loc_column: number; }) => {

            try {

                await prisma.shelf.upsert({
                    where: {
                        id: randomUUID(),
                    },
                    update: {
                        storeId: (await prisma.store.findFirst({
                            where: {
                                platformId: (await prisma.militaryVehiclePlatform.findUnique({
                                    where: {
                                        name: shelf.platformName,
                                    }
                                }))!.id,
                            }
                        }))!.id,
                        loc_row: shelf.loc_row,
                        loc_column: shelf.loc_column,
                    },
                    create: {
                        id: randomUUID(),
                        storeId: (await prisma.store.findFirst({
                            where: {
                                platformId: (await prisma.militaryVehiclePlatform.findFirst({
                                    where: {
                                        name: shelf.platformName,
                                    }
                                }))!.id,
                            }
                        }))!.id,
                        loc_row: shelf.loc_row,
                        loc_column: shelf.loc_column,
                    },
                });

                console.log(`${(await prisma.store.findFirst({
                    where: {
                        platformId: (await prisma.militaryVehiclePlatform.findFirst({
                            where: {
                                name: shelf.platformName,
                            }
                        }))!.id,
                    }
                }))!.id} - Shelf data seeded successfully!`);

            } catch (error) {

                console.error(`Error seeding Shelf data. ${error}`);

            }

        }));
    };

    const seedItems = async () => {

        const itemsResolved = path.resolve(__dirname, './JSON/items.json');

        const forStoreData = async (itemsData: any, stationName: string) => {

            await prisma.item.deleteMany({
                where: {
                    storeId: (await prisma.store.findFirst({
                        where: {
                            platformId: (await prisma.militaryVehiclePlatform.findFirst({
                                where: {
                                    name: stationName,
                                }
                            }))!.id,
                        }
                    }))!.id,
                }
            });
        
            await Promise.all(itemsData.map( async (item: { storeId: string; name: string; platformName: string; unitOfMeasure: any; description: string; reorderPoint: number; }) => {
        
                try {
        
                    await prisma.item.upsert({
                        where: {
                            id: randomUUID(),
                        },
                        update: {
                            storeId: (await prisma.store.findFirst({
                                where: {
                                    platformId: (await prisma.militaryVehiclePlatform.findFirst({
                                        where: {
                                            name: item.platformName,
                                        }
                                    }))!.id,
                                }
                            }))!.id,
                            name: item.name,
                            unitOfMeasure: item.unitOfMeasure,
                            description: item.description,
                            reorderPoint: item.reorderPoint,
                        },
                        create: {
                            id: randomUUID(),
                            storeId: (await prisma.store.findFirst({
                                where: {
                                    platformId: (await prisma.militaryVehiclePlatform.findFirst({
                                        where: {
                                            name: item.platformName,
                                        }
                                    }))!.id,
                                }
                            }))!.id,
                            name: item.name,
                            unitOfMeasure: item.unitOfMeasure,
                            description: item.description,
                            reorderPoint: item.reorderPoint,
                        }
                    });
        
                    console.log(`${item.name} - Item data seeded successfully!`);
                    
                } catch (error) {
        
                    console.error(`Error seeding Item data. ${error}`);
        
                }
        
            }));

        }

        await forStoreData((JSON.parse(fs.readFileSync(itemsResolved, "utf8"))).ratelmk3, 'Ratel MK3');
        console.log('Successfully erased (and reseeded) all Ratel MK3 item records!');

        await forStoreData((JSON.parse(fs.readFileSync(itemsResolved, "utf8"))).arma8x8, 'Arma 8x8');
        console.log('Successfully erased (and reseeded) all Arma 8x8 item records!');

        await forStoreData((JSON.parse(fs.readFileSync(itemsResolved, "utf8"))).mcave001, 'MCAVE 001');
        console.log('Successfully erased (and reseeded) all MCAVE 001 item records!');

        await forStoreData((JSON.parse(fs.readFileSync(itemsResolved, "utf8"))).tank5455, 'Tank - 54/55');
        console.log('Successfully erased (and reseeded) all Tank - 54/55 item records!');

        await forStoreData((JSON.parse(fs.readFileSync(itemsResolved, "utf8"))).rg31Nyala, 'RG - 31 Nyala');
        console.log('Successfully erased (and reseeded) all RG - 31 Nyala item records!');

        await forStoreData((JSON.parse(fs.readFileSync(itemsResolved, "utf8"))).cobra1, 'Cobra 1');
        console.log('Successfully erased (and reseeded) all Cobra 1 item records!');

        await forStoreData((JSON.parse(fs.readFileSync(itemsResolved, "utf8"))).cobra2, 'Cobra 2');
        console.log('Successfully erased (and reseeded) all Cobra 2 item records!');

    };

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

            const stores = await prisma.store.findMany();
            
            for (const store of stores) {

                const shelves = await prisma.shelf.findMany({ where: { storeId: store.id } });

                const items = await prisma.item.findMany({
                    where: {
                        storeId: store.id,
                    }
                });

                const usedStoreItems = new Set();
                const assignedItems = new Set(); // Track used items to avoid duplicates

                for (const shelf of shelves) {
                    
                    for (let row = 1; row <= shelf.numberOfRows; ++row) {
                        
                        for (let col = 1; col <= shelf.numberOfColumns; ++col) {
                            
                            let randomItem;
            
                            // Keep picking a random item until we get one that hasn't been used on this shelf
                            do {
                                randomItem = items[Math.floor(Math.random() * items.length)];
                            } while ((assignedItems.has(randomItem.id) || usedStoreItems.has(randomItem.id)) && assignedItems.size < items.length && usedStoreItems.size < items.length);

                            if (usedStoreItems.has(randomItem.id)) {
                                console.log(` ** Skipping assignment for ${randomItem.name} as it's already used across the store.`);
                                continue;
                            }

                            assignedItems.add(randomItem.id);
                            usedStoreItems.add(randomItem.id);

                            await prisma.inventory.create({
                                data: {
                                    id: randomUUID(),
                                    itemId: randomItem.id,
                                    shelfId: shelf.id,
                                    loc_row: row,
                                    loc_column: col,
                                    quantity: randomItem.reorderPoint * 10,
                                },
                            });
        
                            await prisma.replenishmentLog.upsert({
                                where: {
                                    id: randomUUID(),
                                },
                                update: {},
                                create: {
                                    id: randomUUID(),
                                    userId: (await prisma.user.findUnique({where: {username: 'hydra 093'}}))!.id,
                                    itemId: randomItem.id,
                                    quantityReplenished: (Math.floor((Math.random() * randomItem.reorderPoint)) * 5.5),
                                    reason: 'System Test',
                                }
                            });
            
                            await prisma.transactionalRecordLog.upsert({
                                    where: {
                                    id: randomUUID(),
                                },
                                update: {},
                                create: {
                                    id: randomUUID(),
                                    logType: 'RPL',
                                    logDetails: 'System Test',
                                    userId: (await prisma.user.findUnique({where: {username: 'hydra 093'}}))!.id,
                                }
                            });

                            console.log(`${randomItem.name} - Item data seeded successfully!`);

                        }

                    }

                }

            }

        } catch (error) {

            console.error(`Error seeding Item data. ${error}`);
            
        }

    };

const dbSeed = async () => {

    await seedVehiclePlatforms();
    await seedStations();
    await seedStores();
    await seedUsers();
    await seedShelves();
    // await seedItems();
    // await seedInventory();

};

dbSeed();