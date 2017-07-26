import React from 'react';
import $ from 'jquery';
import io from 'socket.io-client';
import FacebookLogin from 'react-facebook-login';
const socket=io();

export default class App extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state ={
      data: {businesses: []},
      loggedIn: false,
      userData: undefined,
      whoIsGoing: []
    };
    this.enterSearch = this.enterSearch.bind(this);
    this.responseFacebook = this.responseFacebook.bind(this);
    this.update = this.update.bind(this);
    this.pull = this.pull.bind(this);
  }
  componentWillMount()
  {
    if(this.state.whoIsGoing.length == 0)
      socket.emit("get all going",{data: "going"});
    socket.on("receive all going",(data)=>{
      console.log("getting going");
      console.log(data.going);
      this.setState({whoIsGoing: data.going});
    });
    socket.on("update one",(data)=>{
      let whoIsGoing = this.state.whoIsGoing;
      for(var i=0;i<whoIsGoing.length;i++)
      {
        if(whoIsGoing[i]._id == data._id)
          whoIsGoing[i].going.push(data.going);
      }
      this.setState({whoIsGoing: whoIsGoing});
    });
    socket.on("pull one",(data)=>{
      this.pull(data._id,data.going);
    });
    socket.on("add one",(data)=>{
      let whoIsGoing = this.state.whoIsGoing;
      whoIsGoing.push(data);
      this.setState({whoIsGoing: whoIsGoing});
    });
  }
  pull(id,who)
  {
    let whoIsGoing = this.state.whoIsGoing;
    for(var i=0;i<whoIsGoing.length;i++)
    {
      if(whoIsGoing[i]._id == id)
      {
        whoIsGoing[i].going = whoIsGoing[i].going.splice(who,1);
      }
    }
    if(who == this.state.userData)
      socket.emit("pull",{_id: id, pull: this.state.userData});
    this.setState({whoIsGoing: whoIsGoing});
  }
  update(id)
  {
    socket.emit("update",{post_id: id, user_id: this.state.userData});
  }
  responseFacebook(response)
  {
    this.setState({loggedIn: true, userData: response.userID});
  }
  enterSearch(zip_code)
  {
    console.log("trying to find: " + zip_code);
    $.getJSON('/getbars/'+zip_code,function (data){
      console.log("got this many: " + data.businesses.length);
      console.log(data.businesses);
      this.setState({data: data});
    }.bind(this));
  }
  render()
  {
    return(<div className="text-center container-fluid">
        <div className="from-top">
        <h1>I Love the Night Life Baby</h1>
        <h3>Using the Yelp API!</h3> 
        </div>
        
        <SearchBar enterSearch={this.enterSearch}/>
        
        {!this.state.loggedIn ? 
        <FacebookLogin 
              cssClass="well"
              appId='126074648007951'
              autoLoad={true}
              fields="name,picture"
              callback={this.responseFacebook}
              onClick={console.log("trying to login with facebook")}/> :""}
              
        <div className="text-center container-fluid max-1100">
         {this.state.data.businesses.map((d,i)=>
       <EachPlace key={JSON.stringify(d)} 
                  place={d} 
                  loggedIn={this.state.loggedIn}
                  userData={this.state.userData}
                  whoIsGoing={this.state.whoIsGoing}
                  update={this.update}
                  pull={this.pull}/>)}
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
    this.handleSubmit = this.handleSubmit.bind(this);
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
  handleSubmit()
  {
    this.props.enterSearch(this.state.search);
  }
  render()
  {
    return(
      <div>
        Enter Your Zip Code:<input onChange={this.handleChange}
                                    value={this.state.search}/> 
        <button onClick={this.handleSubmit}>Search <i className="fa fa-search"/></button>
      </div>  
    );
  }
}

class EachPlace extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      going: false
    };
    this.getWhoGoes = this.getWhoGoes.bind(this);
    this.updateWhoGoes = this.updateWhoGoes.bind(this);
  }
  componentWillMount()
  {
    let check = false;
    if(this.props.whoIsGoing.length > 0)
     for(var i=0;i<this.props.whoIsGoing.length;i++)
     {
       if(this.props.place.id == this.props.whoIsGoing[i]._id && this.props.whoIsGoing[i].going.indexOf(this.props.userData) > -1)
       {
         check = true;
       }
     }
    if(check)
     this.setState({going: true});
  }
  getWhoGoes()
  {
    //console.log("getting who goes");
    let count = 0;
    if(this.props.whoIsGoing.length > 0)
      for(var i=0;i<this.props.whoIsGoing.length;i++)
      {
        if(this.props.place.id == this.props.whoIsGoing[i]._id)
        {
          count = this.props.whoIsGoing[i].going.length;
        }
      }
    return count;
  }
  updateWhoGoes()
  {
    console.log("updating who goes");

    if(!this.state.going) 
    {  
      this.props.update(this.props.place.id);
      this.setState({going: true});
    }  
    else
    {
      this.props.pull(this.props.place.id,this.props.userData);
      this.setState({going: false});
    }  
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
                  <h6>{this.props.place.location.address1}</h6>
        <h6>{this.props.place.location.city}, {this.props.place.location.zip_code}</h6>
          <h6>{this.props.place.price}</h6>
          <h6>{this.getWhoGoes()} People Going</h6>
          {this.props.loggedIn ? 
          <center>
          <button className="btn"
                  onClick={this.updateWhoGoes}>
            {this.state.going ? "I'm Not Going!" : "I'm Going!"}
          </button>  
          </center> : ""}
        </div>
        </div>  
      </div>  
    );
  }
}