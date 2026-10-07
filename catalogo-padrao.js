// Catálogo padrão da loja. O site usa estes produtos enquanto nada foi salvo
// pelo painel do dono (/admin) ou se a API do catálogo estiver fora do ar.
window.DEFAULT_PRODUCTS = [
  {id:'protein-crisp-bar', cat:'Barra Proteica', name:'Protein Crisp Bar 45g', price:7.50, oldPrice:null, macroLabel:'Proteína/barra', macroVal:'14g', tag:'Novo', photo:'/img/protein-crisp-bar.png', flavors:['Ovomaltine','Chocolate com Avelã','Cookies and Cream'],
    pricesByFlavor:{'Ovomaltine':9.00},
    photosByFlavor:{'Cookies and Cream':'/img/protein-crisp-bar-cookies-and-cream.jpg'}},
  {id:'whey-growth', cat:'Whey Protein', name:'Whey Protein Growth 1kg', price:99.99, oldPrice:149.90, macroLabel:'Proteína/dose', macroVal:'24g', tag:'Novo', photo:'/img/whey-growth.jpg',
    flavors:['Chocolate','Morango','Leite','Cookies and Cream'],
    photosByFlavor:{'Cookies and Cream':'/img/whey-growth-cookies-and-cream.png','Morango':'/img/whey-growth-morango.jpg','Leite':'/img/whey-growth-leite.png'}},
  {id:'creatina-darklab', cat:'Creatina', name:'Creatina Darklab 500g', flavor:'Pure', price:54.90, oldPrice:null, macroLabel:'Creatina/dose', macroVal:'3g', tag:null, photo:'/img/creatina-darklab.png'},
  {id:'creatina-growth', cat:'Creatina', name:'Creatina Growth 250g Monohidratada', flavor:'Sem sabor', price:39.99, oldPrice:null, macroLabel:'Creatina/dose', macroVal:'3g', tag:null, photo:'/img/creatina-growth.png'},
  {id:'mass-titanium', cat:'Hipercalórico', name:'Mass Titanium 17500', flavor:'Morango', price:99.99, oldPrice:null, macroLabel:'Kcal/dose', macroVal:'609kcal', tag:'Novo', photo:'/img/mass-titanium.jpg'},
  {id:'protein-bar-max-titanium', cat:'Barra Proteica', name:'Barra de Proteína Max Titanium', flavor:'Chocolate com Avelã', price:8.50, oldPrice:null, macroLabel:'Proteína/barra', macroVal:'12g', tag:null, photo:'/img/protein-bar-max-titanium.png'}
];
