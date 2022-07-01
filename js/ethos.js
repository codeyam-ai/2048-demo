const React = require('react');
const ReactDOM = require('react-dom/client');
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
        document.getElementById('restart-button').style = "";
        document.getElementById('game').style = "";
      }, 
      className: 'start-button',
      children: "Get Started"
    }
  )
  const root = ReactDOM.createRoot(container);
  root.render(button);

  const claimButton = document.getElementById('claim-button');
  claimButton.onclick = () => {
    const badgeImage = document.getElementById('badge-image');
    const badgeDescription = document.getElementById('badge-description').innerHTML;
    const badgeSrc= badgeImage.getAttribute('src');

    try {
      lib.transact({
        network: 'sui',
        address: '0x0000000000000000000000000000000000000002',
        moduleName: 'DevNetNFT',
        functionName: 'mint',
        gasBudget: 30000,
        inputValues: [
          "Ethos 2048 Game",
          badgeDescription,
          badgeSrc
        ],
        onSigned: () => setLoading(true),
        onComplete: async () => {
          lib.hideWallet(appId);
          setMessage(null);
          setLoading(false);
          oMint();
        }
      })
    } catch (error) {
      console.log(error);
    }
  };
});