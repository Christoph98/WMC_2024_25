class pizza
{
    constructor(name,price,isVeggietarian)
    {
        this.name = name;
        this.price = price;
        this.isVeggietarian = isVeggietarian;
    }
    
}

    let arr = [];
    
    arr.push(new pizza("Margherita", 100, true));
    arr.push(new pizza("Marinara", 150, true));     
    arr.push(new pizza("Quattro Stagioni", 200, true));
    arr.push(new pizza("Carbonara", 250, false));
    arr.push(new pizza("Frutti di Mare", 300, false));
    arr.push(new pizza("Quattro Formaggi", 350, true));
    arr.push(new pizza("Crudo", 400, false));
    
    console.log("Pizzas:", arr);
    arr.reverse();
    console.log("Pizzas reversed:", arr);
   // arr.sort((pizza_a, pizza_b) =>{return pizza_a.price - pizza_b.price});
    arr.sort(compare);
    console.log("Pizzas sorted by price:", arr);

    function compare(pizza_a, pizza_b)
{
    if(pizza_a.price < pizza_b.price)
    {
        return -1;
    }
    if(pizza_a.price > pizza_b.price)
    {
        return 1;
    }
    return 0 ;
}
