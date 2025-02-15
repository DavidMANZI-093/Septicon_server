import express, { Request, Response } from 'express';
import env from './config/env';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import { authenticate } from './controllers/authController';
import { getPlatormData } from './services/getPlatformData';
import { getInventoryData } from './services/getInventoryData';
import { getItemsData } from './services/getItemsData';
import { deleteItem } from './services/deleteItem';
import { createServer } from 'http';
import { Server } from "socket.io";
import { editItem } from './services/editItem';
import { getStationData } from './services/getStationData';
import { addItem } from './services/createItem';
import { supplyItem } from './services/supplyItem';
import { replenishItem } from './services/replenishItem';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:3000" }
});

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

app.use("/api/server-test", (res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    res.send({"msg": "All setup perfectly!"});
});

app.use("/api/authenticate", async (req: Request, res: Response) => {
    res.send(await authenticate(req.body));
});

app.use("/api/stores/platforms", async (req: Request, res: Response) => {
    res.send(await getPlatormData(req.headers.authorization));
});

app.use("/api/stations", async (req: Request, res: Response) => {
    res.send(await getStationData(req.headers.authorization));
});

app.use("/api/stores/inventory", async (req: Request, res: Response) => {
    res.send(await getInventoryData(req.headers.authorization, req.body.storeId));
});

app.use("/api/stores/items", async (req: Request, res: Response) => {
    res.send(await getItemsData(req.headers.authorization, req.body.storeId));
});

app.use("/api/stores/add", async (req: Request, res: Response) => {
    const result = await addItem(req.body); 
    if (result.status === 200) {
        io.emit("itemAdded")
    }
    res.status(result.status).json({
        status: result.status,
        statusText: result.msg
    });
});

app.use("/api/stores/supply", async (req: Request, res: Response) => {
    const result = await supplyItem(req.body); 
    if (result.status === 200) {
        io.emit("itemSupplied")
    }
    res.status(result.status).json({
        status: result.status,
        statusText: result.msg
    });
});

app.use("/api/stores/replenish", async (req: Request, res: Response) => {
    const result = await replenishItem(req.body); 
    if (result.status === 200) {
        io.emit("itemReplenished")
    }
    res.status(result.status).json({
        status: result.status,
        statusText: result.msg
    });
});

app.use("/api/stores/edit", async (req: Request, res: Response) => {
    const result = await editItem(req.body); 
    if (result.status === 200) {
        io.emit("itemEdited")
    }
    res.status(result.status).json({
        status: result.status,
        statusText: result.msg
    });
});

app.use("/api/stores/delete", async (req: Request, res: Response) => {
    const result = await deleteItem(req.body); 
    if (result.status === 200) {
        io.emit("itemDeleted")
    }
    res.status(result.status).json({
        status: result.status,
        statusText: result.msg
    });
});

io.on("connection", (socket) => {
    console.log("Client connected: ", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected: ", socket.id);
    });

});

server.listen(env.PORT, "localhost", () => {
    console.log(`Server up and running at http://localhost:${env.PORT}`);
});