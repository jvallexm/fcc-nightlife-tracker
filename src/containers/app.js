import React from 'react';

export default class App extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state ={
      data: {businesses: []}
    };
  }
  render()
  {
    return(<div className="text-center container-fluid">
        <div className="from-top">
        <h1>I Love the Night Life Baby</h1>
        <h3>Using the Yelp API!</h3> 
        </div>
        <SearchBar />
        <div className="text-center container-fluid max-1100">
         {this.state.data.businesses.map((d,i)=>
       <EachPlace key={JSON.stringify(d)} place={d} />)}
        </div>  
      </div>);
  }
}

class SearchBar extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      search: ""
    };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e)
  {
    if(/\D/g.test(e.target.value) || e.target.value.length > 5)
    {  
      console.log("nope");
      return false;
    }  
    else
     this.setState({search: e.target.value});
  }
  render()
  {
    return(
      <div>
        Enter Your Zip Code:<input onChange={this.handleChange}
                                    value={this.state.search}/> 
        <button>Search <i className="fa fa-search"/></button>
      </div>  
    );
  }
}

class EachPlace extends React.Component
{
  constructor(props)
  {
    super(props);
  }
  render()
  {
    return(
      <div className="bar text-center container-fluid middle-text">
        <h4>{this.props.place.name}</h4>

       <div className="row"> 
       <div className="col-sm-6">  
       <img src={this.props.place.image_url} />
       </div> 
        <div className="col-sm-6  middle-text padding-10">
                  <h6>{this.props.place.location.address1}{this.props.place.location.address2.length > 0 ? " "+this.props.place.location.address2: ""}</h6>
        <h6>{this.props.place.location.city}, {this.props.place.location.zip_code}</h6>
          <h6>{this.props.place.price}</h6>
          <h6>0 People Going</h6>
          <center>
          <button className="btn">
            I'm Going!
          </button>  
          </center>  
        </div>
        </div>  
      </div>  
    );
  }
}