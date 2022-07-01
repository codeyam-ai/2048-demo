const React = require('react');
const ReactDOM = require('react-dom/client');
const { components, lib } = require('ethos-wallet-beta')

window.requestAnimationFrame(function () {
  let _signer;
  lib.initialize({
    walletAppUrl: 'http://localhost:3000',
    appId: '2048-demo',
    network: 'sui'
  })

  const setMaxClaimedValue = async () => {    
    const address = await _signer.getAddress()
    const suiContents = await lib.walletContents(address, 'sui')
    
    const loader = document.getElementById('loader');
    loader.style = 'display: none;'
    
    let maxClaimedItem = {value: 0};
    for (const item of suiContents) {
      const value = parseInt(item.description.slice("This player has unlocked the ".length))
      if (!value || value < maxClaimedItem.value) continue;
      item.value = value;
      maxClaimedItem = item;
    }
    window.maxClaimedValue = maxClaimedItem.value;

    const badgeDescription = document.getElementById('badge-description').innerHTML;
    const badgeValue = parseInt(badgeDescription.slice("This player has unlocked the ".length))

    if (badgeValue > maxClaimedItem.value) {
      const badge = document.getElementById('badge');
      badge.style = ''  
    }

    if (maxClaimedItem.value > 0) {
      const claimedBadge = document.getElementById('claimed-badge');
      claimedBadge.style = '';
  
      const claimedBadgeImage = document.getElementById('claimed-badge-image');
      claimedBadgeImage.src = maxClaimedItem.imageUri;  
    }
  }

  const container = document.getElementById('ethos-start')
  const button = React.createElement(
    components.styled.SignInButton, 
    { 
      onClick: () => window.signIn = true,
      onProviderSelected: async ({ provider, signer }) => {
        _signer = signer;
        if (signer) {
          window.signIn = false;
          container.style = "display: none;";        
          document.getElementById('restart-button').style = "";
          document.getElementById('game').style = "";  
        }
        setMaxClaimedValue();
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
        unpopulatedTransaction: {
          moduleName: 'devnet_nft',
          functionName: 'mint',
          gasBudget: 30000,
          inputValues: [
            "Ethos 2048 Game",
            badgeDescription,
            badgeSrc
          ]
        },
        // onSigned: () => setLoading(true),
        onComplete: async () => {
          lib.hideWallet();
          setMaxClaimedValue();
          // setMessage(null);
          // setLoading(false);
          // oMint();
        }
      })
    } catch (error) {
      console.log(error);
    }
  };
});