import "./styles.css";
import { x, render, hook } from "./x";

const myComponent = ({ greet, counterValue = 0, preloadedItems = [] } = {}) => {
  x("div", {}, () => {
    const counter = hook(counterValue);
    const clickHandler = hook(() => counter(counter() + 1));
    const items = hook(preloadedItems);
    const inputValue = hook("");
    const inputChangeHandler = hook(({ target }) => inputValue(target.value));
    const submitHandler = hook(event => {
      event.preventDefault();
      items([...items(), inputValue()]);
      event.target.reset();
    });
    x("div", {}, () => {
      x("h1", {}, `Hello ${greet || "World"}`);
      x("p", {}, `Value: ${counter()}`);

      if (counter() < 5) {
        x("button", { onclick: clickHandler() }, "Increment");
      } else {
        x("p", {}, "You have reached the max");
      }

      x("hr");
      x("form", { onsubmit: submitHandler() }, () => {
        x("input", {
          placeholder: `Add Item ${items().length + 1}`,
          oninput: inputChangeHandler(),
          required: true
        });
        x("button", {}, "Add");
      });
      x("ul", {}, () => {
        items().forEach(i => x("li", {}, i));
      });
    });
  });
};

render(document.getElementById("app"), () => {
  myComponent();
  myComponent({
    greet: "You",
    counterValue: 2,
    preloadedItems: ["Hey", "There"]
  });
});
