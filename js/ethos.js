const React = require('react');
const ReactDOM = require('react-dom');
const { components, lib } = require('ethos-wallet-beta')

window.requestAnimationFrame(function () {
  lib.initialize({
    walletAppUrl: 'http://localhost:3000',
    appId: '2048-demo',
    network: 4
  })
  const container = document.getElementById('ethos-start')
  const button = React.createElement(
    components.styled.SignInButton, 
    { 
      onClick: () => window.signIn = true,
      onProviderSelected: () => {
        window.signIn = false;
        container.style = "display: none;";
        console.log("CONTAINER", container.style)
        document.getElementById('restart-button').style = "";
        document.getElementById('game').style = "";
      }, 
      className: 'start-button',
      children: "Get Started"
    }
  )
  ReactDOM.render(button, container);
});