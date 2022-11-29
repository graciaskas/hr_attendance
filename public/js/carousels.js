//carousel for services
$('.products_').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplaySpedd: 2000,
    autoplay: true,
    nextArrow: $(".next"),
    prevArrow: $(".prev"),

    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                infinite: true,
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
    ]          
});


//carousel for odoo offers
$('.odoo__offers').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplaySpedd: 2500,
    autoplay: true,
    nextArrow: $(".next"),
    prevArrow: $(".prev"),     
});

//carousel for services
$('.services_').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplaySpedd: 2000,
    autoplay: true,
    nextArrow: $(".next"),
    prevArrow: $(".prev"),

    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                infinite: true,
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        },
    ]          
});


//Carousel for Site Banner
$('.carousel_banner').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplaySpedd: 2000,
    autoplay: true,
    nextArrow: $(".next"),
    prevArrow: $(".prev"),
});

