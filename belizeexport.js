var start2016 = ee.Date('2016-03-01');
var finish2016 = ee.Date('2016-04-09');
var start2017 = ee.Date('2017-03-01');
var finish2017 = ee.Date('2017-04-28');
var start2018 = ee.Date('2018-03-01');
var finish2018 = ee.Date('2018-04-30');

var belizePoint = ee.Feature(ee.Geometry.Point([-88.213218560791, 17.500963565752446]));

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


var belizeFilteredCollection2016 = ee.ImageCollection(sentinel2)
      .filterBounds(belizePoint)
      .filterDate(start2016,finish2016);
      
var belizeFilteredCollection2017 = ee.ImageCollection(sentinel2)
      .filterBounds(belizePoint)
      .filterDate(start2017,finish2017)
      .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 100)
      .map(sentinel2QA);

var belizeFilteredCollection2018 = ee.ImageCollection(sentinel2)
      .filterBounds(belizePoint)
      .filterDate(start2018,finish2018)
      .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 100)
      .map(sentinel2QA);

var vizParams = {bands: ['B4', 'B5', 'B6'],min: [0,0,0],max: [3000, 3000, 3000]};
//B2 B3 B4 is BGR

var belizeImage2017 = ee.Image(belizeFilteredCollection2017.min());
Map.addLayer(belizeImage2017, vizParams, 'img_2017');

var belizeImage2016 = ee.Image(belizeFilteredCollection2016.min());
Map.addLayer(belizeImage2016, vizParams, 'img_2016');

var belizeImage2018 = ee.Image(belizeFilteredCollection2018.min());
Map.addLayer(belizeImage2018, vizParams, 'img_2018');


Map.centerObject(belizePoint);

Export.image.toDrive({
  image: belizeImage2016,
  description: 'belizeImage2016',
  scale: 30
});

Export.image.toDrive({
  image: belizeImage2017,
  description: 'belizeImage2017',
  scale: 30
});

Export.image.toDrive({
  image: belizeImage2018,
  description: 'belizeImage2018',
  scale: 30
});