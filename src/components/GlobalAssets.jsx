import React, { useEffect } from 'react';

const GlobalAssets = () => {
  useEffect(() => {
    const addStylesAndScripts = () => {
      const linkBootstrap = document.createElement('link');
      linkBootstrap.href = 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css';
      linkBootstrap.rel = 'stylesheet';
      document.head.appendChild(linkBootstrap);

      const scriptRecaptcha = document.createElement('script');
      scriptRecaptcha.src = 'https://www.google.com/recaptcha/api.js';
      scriptRecaptcha.async = true;
      scriptRecaptcha.defer = true;
      document.body.appendChild(scriptRecaptcha);

      const scriptCookieConsent = document.createElement('script');
      scriptCookieConsent.src = 'https://cdn.osano.com/cookieconsent/OsanoCookieConsent.js';
      document.body.appendChild(scriptCookieConsent);

      const scriptJQuerySlim = document.createElement('script');
      scriptJQuerySlim.src = 'https://code.jquery.com/jquery-3.5.1.slim.min.js';
      document.body.appendChild(scriptJQuerySlim);

      const scriptPopper = document.createElement('script');
      scriptPopper.src = 'https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js';
      document.body.appendChild(scriptPopper);

      const scriptBootstrap = document.createElement('script');
      scriptBootstrap.src = 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js';
      document.body.appendChild(scriptBootstrap);

      const scriptJQuery = document.createElement('script');
      scriptJQuery.src = 'https://code.jquery.com/jquery-3.5.1.min.js';
      document.body.appendChild(scriptJQuery);
    };

    addStylesAndScripts();

    return () => {
      const linksToRemove = document.querySelectorAll('link[href^="https://stackpath.bootstrapcdn.com"]');
      linksToRemove.forEach((link) => document.head.removeChild(link));

      const scriptsToRemove = document.querySelectorAll('script[src^="https://"]');
      scriptsToRemove.forEach((script) => document.body.removeChild(script));
    };
  }, []);

  return null;
};

export default GlobalAssets;
