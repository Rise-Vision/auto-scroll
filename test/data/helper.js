var getSampleParagraph = function () {
  var fragment = document.createDocumentFragment(),
    p = document.createElement("p");

  p.innerHTML = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vitae tristique lorem. Nulla eget diam ac arcu mollis laoreet. Aliquam nibh mauris, pharetra ut sollicitudin eget, feugiat id eros. Morbi varius lobortis enim, non congue libero venenatis et. Phasellus sed dolor at nibh pulvinar viverra vel nec nisi. Donec semper, augue id hendrerit tempor, urna nulla venenatis dolor, at semper risus odio id erat. Etiam consectetur interdum dui in aliquet. Nullam eget orci erat. Vivamus suscipit at mauris vel accumsan. Fusce tincidunt elementum fermentum. Praesent lobortis massa vitae sagittis tincidunt. Sed quis libero nec augue ullamcorper varius.";

  fragment.appendChild(p);

  return fragment;

};

var getSampleList = function (numItems) {
  var fragment = document.createDocumentFragment(),
    ul = document.createElement("ul"),
    li;

  for (var i = 0; i < numItems; i += 1) {
    li = document.createElement("li");
    li.innerHTML = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
    li.setAttribute("data-id", "item" + i);
    ul.appendChild(li);
  }

  fragment.appendChild(ul);

  return fragment;
};