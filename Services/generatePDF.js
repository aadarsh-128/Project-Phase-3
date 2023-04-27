const PDFDocument = require('pdfkit');
const fs = require('fs');
// var image = "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";
    
    //doc.moveDown(3)
function buildPDF(dataCallback, endCallback, data, image, result){
    // Create a document
    //var image1 = new Buffer.from(image.replace('data:image/jpg;base64,',''), 'base64');
    const doc = new PDFDocument({size:'A4'});
    console.log(data);
    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    //doc.pipe(fs.createWriteStream('output.pdf'));

    // Embed a font, set the font size, and render some text
    doc.on("data", dataCallback);
    doc.on("end", endCallback);
    
    doc
    .fontSize(25)
    .text('X-Ray Report', 10, 10, {
        align: 'center'
    })
    .fontSize(15)
    .image(image, 50, 50, {
        //align: 'right',
        width: 250,
    })
    .fillColor('#000')
    .text('Name  : '+data.name ,275, 70,{
        align: 'right'
    })
    // .text('Email  :'+data.email , 200, 70,{
    //     align: 'right'
    // })
    .text('YOB    :'+data.yearOfBirth, 200, 90,{
        align: 'right'
    }).text('Weight  :'+data.weight, 200, 110,{
        align: 'right'
    }).text('Height  :'+data.height, 200, 130,{
        align: 'right'
    })
    .text("Remark: "+result, 50, 400, {
        align: "left"
    });
    // doc
    // .image(image1, {
    //     align: 'center',
    //     //valign: 'center'
    // })

    // doc.text("Hello World").moveTo(1000, 100)
    
    // doc.image(myHexData, 0, 15, {width: 300})
    //     .text('Proportional to width', 0, 0);


    doc.end();
    // Add an image, constrain it to a given size, and center it vertically and horizontally
    // doc.image('path/to/image.png', {
    // fit: [250, 300],
    // align: 'center',
    // valign: 'center'
    // });

    // // Add another page
    // doc
    // .addPage()
    // .fontSize(25)
    // .text('Here is some vector graphics...', 100, 100);

    // // Draw a triangle
    // doc
    // .save()
    // .moveTo(100, 150)
    // .lineTo(100, 250)
    // .lineTo(200, 250)
    // .fill('#FF3300');

    // // Apply some transforms and render an SVG path with the 'even-odd' fill rule
    // doc
    // .scale(0.6)
    // .translate(470, -380)
    // .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
    // .fill('red', 'even-odd')
    // .restore();

    // // Add some text with annotations
    // doc
    // .addPage()
    // .fillColor('blue')
    // .text('Here is a link!', 100, 100)
    // .underline(100, 100, 160, 27, { color: '#0000FF' })
    // .link(100, 100, 160, 27, 'http://google.com/');

    // Finalize PDF file
    //doc.end();
}

module.exports = {buildPDF}