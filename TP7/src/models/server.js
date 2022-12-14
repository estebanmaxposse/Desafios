const express = require('express');
const { Server: HttpServer } = require('http'); 
const { Server: IOServer } = require('socket.io');
const path = require('path');
const dbManager = require('../utils/mongoManager');
const productRouter = require('../routes/productRoutes');

const PORT = 8000;

const productManager = new dbManager('products');
const messageManager = new dbManager('messages')

const products = productManager.getAll();
const messages = messageManager.getAll();

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer)

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../../views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, '../../public')))

app.use(productRouter);

const startServer = () => {
    httpServer.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
}

io.on('connection', async (socket) => {
    socket.emit('products', await productManager.getAll());
    socket.emit('messages', await messageManager.getAll())

    socket.on('new-product', async data => {
        await productManager.save(data);
        io.sockets.emit('products', await productManager.getAll());
    });

    socket.on('new-message', async data => {
        await messageManager.save(data);
        io.sockets.emit('messages', await messageManager.getAll());
        console.log('emitted message with ', await messageManager.getAll())
    })
})



module.exports = startServer;