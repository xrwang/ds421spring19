var start2016 = ee.Date('2016-12-01');
var finish2016 = ee.Date('2016-12-09');
var start2017 = ee.Date('2017-03-01');
var finish2017 = ee.Date('2017-04-28');
var start2018 = ee.Date('2018-01-01');
var finish2018 = ee.Date('2018-12-30');



var getQABits = function(image, start, end, newName) {
    // Compute the bits we need to extract.
    var pattern = 0;
    for (var i = start; i <= end; i++) {
       pattern += Math.pow(2, i);
    }
    // Return a single band image of the extracted QA bits, giving the band
    // a new name.
    return image.select([0], [newName])
                  .bitwiseAnd(pattern)
                  .rightShift(start);
};

var sentinel2QA = function(image) {
  var cloud_mask = image.select("QA60");
  var opaque = getQABits(cloud_mask, 10, 10, "opaque");
  var cirrus = getQABits(cloud_mask, 11, 11, "cirrus");
  var mask = opaque.or(cirrus);
  return image.updateMask(mask.not());
}


var filteredCollection2016 = ee.ImageCollection(sentinel2)
      .filterBounds(cartagenaBox)
      .filterDate(start2016,finish2016);

var filteredCollection2017 = ee.ImageCollection(sentinel2)
      .filterBounds(cartagenaBox)
      .filterDate(start2017,finish2017)
      .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 100)
      .map(sentinel2QA);

console.log(filteredCollection2017)
var vizParams = {bands: ['B2', 'B3', 'B4'],min: [0,0,0],max: [3000, 3000, 3000]};
//B2 B3 B4 is BGR


var image2017 = ee.Image(filteredCollection2017.min());
Map.addLayer(image2017, vizParams);

var image2016 = ee.Image(filteredCollection2016.min());
Map.addLayer(image2016, vizParams);
Map.centerObject(cartagenaBox);
