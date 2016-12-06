
## Examples

#### Simple Fully Functioning Example

```javascript
var Actions = Reflux.createActions([
	'increment',
	'decrement',
	'changeBy'
]);

class CounterStore extends Reflux.Store
{
	constructor()
	{
		super();
		this.state = {count: 0};
		this.listenables = Actions;
	}
	
	onIncrement()
	{
		this.setState({count: this.state.count+1});
	}
	
	onDecrement()
	{
		this.setState({count: this.state.count-1});
	}
	
	onChangeBy(amount)
	{
		this.setState({count: this.state.count+amount});
	}
}

class Counter extends Reflux.Component
{
	constructor(props)
	{
		super(props);
		this.store = CounterStore;
	}
	
	render()
	{
		return <div>{this.state.count}</div>;
	}
}

ReactDOM.render
(
	<Counter/>,
	document.querySelector('#react-root')
);

setInterval(Actions.increment, 1000);
```

[Back to docs](../)
