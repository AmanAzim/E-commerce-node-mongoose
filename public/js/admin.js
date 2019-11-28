const deleteProduct = btn => {
    const productId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

    const productElement = btn.closest('article');//Will give the closest ancestor

    fetch(`/admin/product/${productId}`, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf,
        }
    }).then( res => {
        return res.json();
    })
    .then( res => {
        productElement.parentNode.removeChild(productElement);
    })
    .catch( err => console.log(err));
};