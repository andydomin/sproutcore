// ========================================================================
// SC.metricsForString Tests
// ========================================================================

module("SC.metricsForString");

test('metricsForString.width increases as the length of the string increases', function(){
  var string = "short";
  var before, after;
  before = SC.metricsForString(string, '').width;
  string += "longer";
  after = SC.metricsForString(string, '').width;
  ok(after > before, "width of string should be longer if the string is longer");
});

test('maxMetricsForString.width increases as the length of the strings increases', function(){
  var arrayOfStrings = ["short", "string"];
  var before, after;
  before = SC.maxMetricsForStrings(arrayOfStrings, '').width;
  arrayOfStrings.push("longer");
  after = SC.maxMetricsForStrings(arrayOfStrings, '').width;
  ok(after > before, "width of strings should be longer if the string is longer");
});

test('metricsForString should escape strings', function(){
  var string = "<stupidString>", escapedString = SC.RenderContext.escapeHTML(string);
  var stringLength, escapedStringLength;
  // Pass this string and it will be escaped
  stringLength = SC.metricsForString(string, '').width;
  // Pass escaped string and ask not to be escaped
  escapedStringLength = SC.metricsForString(escapedString, '', '', YES).width;
  ok(stringLength = escapedStringLength, "length of escaped strings equal "  + stringLength);
});

