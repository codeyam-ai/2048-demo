const React = require('react');
const ReactDOM = require('react-dom/client');
const { EthosWrapper, SignInButton, ethos } = require('ethos-wallet-beta')

window.requestAnimationFrame(function () {
  let _signer;

  const walletAppUrl = window.location.href.startsWith('file') || window.location.href.startsWith('http://127.0.0.1:') ?
    'http://localhost:3000' :
    (
      window.location.href.indexOf('-staging') > -1 ?
        'https://sui-wallet-staging.onrender.com' :
        'https://ethoswallet.xyz'
    )

  document.getElementById('wallet-explorer-link').href = `${walletAppUrl}/dashboard`

  const ethosConfiguration = {
    walletAppUrl: walletAppUrl,
    appId: '2048-demo'
  }

  const setMaxClaimedValue = async () => {
    if (!_signer) return;
    const address = await _signer.getAddress()
    const { nfts, balance } = await ethos.getWalletContents(address, 'sui')

    console.log("BALANCE", balance)
    if (balance < 3000) {
      ethos.dripSui({ address });
    }

    const loader = document.getElementById('loader');
    loader.style = 'display: none;'

    let maxClaimedItem = { value: 0 };
    for (const item of nfts) {
      const value = parseInt(item.description.slice("This player has unlocked the ".length))
      if (!value || value < maxClaimedItem.value) continue;
      item.value = value;
      maxClaimedItem = item;
    }
    window.maxClaimedValue = maxClaimedItem.value;

    const badgeDescription = document.getElementById('badge-description').innerHTML;
    const badgeValue = parseInt(badgeDescription.slice("This player has unlocked the ".length))

    const badge = document.getElementById('badge');
    if (badgeValue > maxClaimedItem.value) {
      badge.style = ''
    } else {
      badge.style = 'display: none;'
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
    SignInButton,
    {
      key: 'sign-in-button',
      onClick: () => window.signIn = true,
      className: 'start-button',
      children: "Get Started"
    }
  )

  const wrapper = React.createElement(
    EthosWrapper,
    {
      ethosConfiguration,
      onWalletConnected: async ({ provider, signer }) => {
        console.log("ON WALLET CONNECTED", provider, signer)
        document.getElementById('start-loader').style = "display: none;";
        document.getElementById('loading-messages').style = "display: none;";

        _signer = signer;
        if (signer) {
          window.signIn = false;
          container.style = "display: none;";
          document.getElementById('restart-button').style = "";
          document.getElementById('game').style = "";
          const logout = document.getElementById('logout')
          logout.style = "";
          logout.onclick = async () => {
            await ethos.logout();
            location.reload();
          }
        } else {
          container.style = "";
        }
        setMaxClaimedValue();
      },
      children: [button]
    }
  )

  const root = ReactDOM.createRoot(container);
  root.render(wrapper);

  const claimButton = document.getElementById('claim-button');
  claimButton.onclick = () => {
    const badge = document.getElementById('badge');
    badge.style = 'display: none';

    const claimedBadge = document.getElementById('claimed-badge');
    claimedBadge.style = 'display: none';

    const loader = document.getElementById('loader');
    loader.style = ''

    const badgeImage = document.getElementById('badge-image');
    const badgeDescription = document.getElementById('badge-description').innerHTML;
    const badgeSrc = badgeImage.getAttribute('src');

    try {
      const details = {
        network: 'sui',
        address: '0x0000000000000000000000000000000000000002',
        moduleName: 'devnet_nft',
        functionName: 'mint',
        inputValues: [
          "Ethos 2048 Game",
          badgeDescription,
          badgeSrc
        ],
        gasBudget: 1000
      }

      ethos.transact({
        signer: _signer,
        details,
        // onSigned: () => setLoading(true),
        onComplete: async (result) => {
          const completedResult = await result;
          console.log("COMPLETED RESULT", result)
          ethos.hideWallet();
          await setMaxClaimedValue();

          loader.style = 'display: none';
          // setMessage(null);
          // setLoading(false);
          // oMint();
        }
      })
    } catch (error) {
      console.log(error);
    }
  };

  document.getElementById('2048-title').onclick = () => ethos.showWallet();
});