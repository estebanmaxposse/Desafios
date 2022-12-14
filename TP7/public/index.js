const server = io()
const pug = require('pug');

//Products

//Render without template
const renderProducts = (data) => {
    console.log('New prod render!');
    let table = '<table class="table table-stripped w-75 m-auto table-hover table-bordered">'
    table += '<thead><tr><th scope="col">ID #</th><th scope="col">Title</th><th scope="col">price</th><th scope="col">Thumnbnail</th></tr></thead>'
    table += '<tbody>'
    data.forEach(product => {
        table += `
        <tr class='text-center'>
            <th scope='row'> ${product.id} </th>
            <td class='text-center'><a href=${product.url}>${product.title}</a></td>
            <td class='text-center'>${product.price}</td>
            <td class='text-center'><img src=${product.thumbnail} class='w-25 h-auto' />
        </tr>`
    });
    table += '</tbody></table>'
    return table
}

//Render with PUG
async function renderTemplateTable(data) {
    try {
        let resText = await fetch('templates/table.pug')
        let textTemplate = await resText.text()
        let compileTemplate = pug.compile(textTemplate)
        let html = compileTemplate({products: data})
        return html;
    } catch (error) {
        console.log(error)
    }
}

let productForm = document.getElementById('form-product')
const addProduct = (e) => {
    const product = {
        title: document.getElementById('product-title').value,
        price: document.getElementById('product-price').value,
        thumbnail: document.getElementById('product-thumbnail').value,
    };
    server.emit('new-product', product);
    productForm.reset()
    return false
};

server.on('products', async data => {
    if (!data.length) {
        document.getElementById('product-container').innerHTML = '<div class="alert alert-danger w-25" role="alert"><p class="text-center">No products added yet!</p></div>'
    }else{
        document.getElementById('product-container').innerHTML = await renderTemplateTable(data)
    }
});

//Messages & Chat

const renderMessages = (data) => {
    const htmlMessage = data.map((element, index) => {
        return (`
        <div class='text-center d-flex flex-column align-items-start m-2'>
            <div>
                <span class="fw-bold" style='color:blue; font-weight: bold;'>${element.author}</span>
                <span style='color:brown'>${element.date}</span>
            </div>
            <p class="fst-italic" style='color:green; font-style: italic'>${element.text}</p>
        </div>`
        )
        }).join('');
        document.getElementById('messages').innerHTML = htmlMessage;
}

let text = document.getElementById('message-text');

const addMessage = (e) => {
    const message = {
        author: {
            name: document.getElementById('message-author').value
        },
        text: text.value,
        date: new Date().toLocaleString(),
    };
    server.emit('new-message', message);
    text.value = ''
    text.focus()

    return false;
}

server.on('messages', data => {
    renderMessages(data);
});