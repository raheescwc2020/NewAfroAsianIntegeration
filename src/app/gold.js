import React from 'react';

export default function ArticleGold() {
  return (
    <main className="aan-article-container">
      {/* 6. Meta Elements - Must not compete with headline */}
      <div className="aan-meta-top">
        <span className="aan-category">Gold & Bullion Dialogue Series | Part 1</span>
      </div>

      {/* 2. Headline (H1) - Strongest typographic element */}
      <h1 className="aan-article-headline">
        Gold Rush: Myth & Reality
      </h1>

      {/* 6. Byline & Date - Smaller, muted color */}
      <div className="aan-byline-row">
        <span className="aan-author">By Renu Malhotra</span>
        <span className="aan-date">February 19, 2026</span>
      </div>

      {/* 4. Hero Image - Always BELOW the headline */}
      <div className="aan-hero-wrapper">
        <img 
          src="/assets/gold_series.png" 
          alt="Gold bullion bars" 
          className="aan-hero-img"
        />
      </div>

      <article className="aan-article-body">
        {/* Introduction */}
        <p className="aan-lead-text">
          An expert practitioner dialogue on geopolitics, trade, trust, and gold’s role 
          in the architecture of global commerce.
        </p>

        <p>
          Gold has never been merely a commodity. Across centuries, it has functioned as 
          a medium of trust, a reserve of value, and a quiet anchor of global trade.
          In moments of monetary uncertainty, geopolitical realignment, and systemic stress, 
          gold reasserts itself—not as speculation, but as structure.
        </p>

        <p>
          The Gold & Bullion Dialogue Series examines gold beyond price charts and market noise, exploring its role within cross-border trade frameworks, institutional trust systems, and the lived realities of markets spanning Africa, Asia, and West Asia.
        </p>

        {/* Framing Note - Boxed as per content */}
        <div className="aan-callout-box">
          <h4 className="aan-callout-title">Editor’s Framing Note</h4>
          <p>
          The Gold & Bullion Dialogue Series begins with practitioner-led perspectives from within the gold and bullion ecosystem, offering ground-level insight into the operational, trust, and trade realities that underpin global markets.
          </p>
        </div>

        <h2 className="aan-section-header">Feature Interview</h2>
        
        <div className="aan-interview-meta">
          <p><strong>Guest:</strong> Sarwat Abdul Razzaq (Chairperson, ARY Gold Laboratory Owner, SARY Jewellery, Dubai)</p>
          <p><strong>Interviewer:</strong> Renu Malhotra (Editor-in-Chief, AfroAsianNews)</p>
        </div>

        <div className="aan-q-block">
          <h3 className="aan-question">Gold’s Role in the Global Economy</h3>
          <p><strong>Q: How is gold positioned in the current global economic environment?</strong></p>
          <p>Gold has shown steady resilience despite global economic uncertainty. Demand continues to be driven by a combination of investment interest and traditional consumption, particularly in Asia and the Middle East. While short-term price movements reflect interest rate expectations and macroeconomic signals, the underlying role of gold as a store of value remains intact.</p>
          <p>Gold continues to play a significant role in both the global financial system and cultural consumption. Its relevance extends beyond pricing, reflecting deep-rooted trust across economies and societies.</p>
        </div>

        <div className="aan-q-block">
          <h3 className="aan-question">Monetary Policy, Interest Rates, and Inflation</h3>
          <p><strong>Q: How do interest rates and monetary policy affect gold prices?</strong></p>
          <p>Market sentiment toward gold is increasingly shaped by global monetary policy decisions, particularly in the United States and Europe. Interest rate movements directly influence investor behaviour as markets reassess the balance between yield-bearing assets and safe havens.</p>
          <p>The relationship between gold prices and interest rates is not always linear. Real interest rates, rather than nominal rates, are especially important. When inflation-adjusted yields remain low or negative, gold tends to perform well, even during periods of monetary tightening.</p>
          
          <p><strong>Q: What role does inflation play in sustaining gold demand?</strong></p>
          <p>Inflation concerns remain a key driver of gold demand. Even when headline inflation eases, underlying uncertainties continue to support interest in gold, especially during periods of financial market volatility.</p>
        </div>

        <div className="aan-q-block">
          <h3 className="aan-question">Central Banks and Strategic Demand</h3>
          <p><strong>Q: Why are central banks increasing their gold reserves?</strong></p>
          <p>Central bank purchases have remained strong as many countries seek to diversify reserves and reduce dependence on major currencies. Gold is increasingly viewed as a strategic reserve asset that provides stability and insulation from currency and geopolitical risks.</p>
          <p>This sustained accumulation has provided a long-term support base for gold prices and reflects a structural shift rather than a short-term trend.</p>
        </div>

        <div className="aan-q-block">
          <h3 className="aan-question">Investment Behaviour and Portfolio Allocation</h3>
          <p><strong>Q: How are different types of investors approaching gold today?</strong></p>
          <p>Investor behaviour has become more segmented. Short-term traders respond quickly to economic data and central bank commentary, contributing to near-term volatility. In contrast, long-term investors gradually accumulate gold, viewing price corrections as buying opportunities.</p>
          <p>Institutional investors such as pension funds and sovereign wealth funds are allocating modest but consistent portions of their portfolios to gold. The emphasis is on diversification and risk management rather than short-term returns.</p>

          <p><strong>Q: How is gold used within long-term wealth planning?</strong></p>
          <p>High-net-worth individuals and family offices increasingly view gold as a tool for long-term wealth preservation. Rather than timing the market, they adopt disciplined allocation strategies, integrating gold into broader frameworks for diversification, liquidity management, and risk mitigation.</p>
        </div>

        <div className="aan-q-block">
          <h3 className="aan-question">Regional and Consumer Demand Patterns</h3>
          <p><strong>Q: How does gold demand differ across regions?</strong></p>
          <p>Gold demand varies significantly by region. In countries such as India and China, gold serves both as a form of savings and a cultural asset. Rural demand is closely linked to agricultural income and seasonal factors, while urban demand is more sensitive to price trends and investment considerations.</p>
          <p>Jewellery demand has shown recovery in key Asian markets, supported by seasonal buying and improving consumer sentiment. Even during periods of higher prices, demand often adjusts in form rather than disappearing.</p>
        </div>

        <div className="aan-q-block">
          <h3 className="aan-question">Supply, Refining, and Responsible Sourcing</h3>
          <p><strong>Q: What challenges are emerging on the supply side of the gold market?</strong></p>
          <p>Mining output has remained largely stable, but rising input costs and regulatory pressures are affecting profitability. Recycling has increased modestly during periods of higher prices.</p>
          <p>The supply chain is under growing pressure to improve efficiency, compliance, and transparency. Responsible sourcing and traceability have become essential, driven by regulatory scrutiny and buyer expectations.</p>

          <p><strong>Q: How is the refining and trading landscape changing?</strong></p>
          <p>Refining capacity has expanded in some regions while consolidating in others, leading to shifts in global trade flows. Emerging hubs in Asia and the Middle East are playing an increasingly prominent role in refining, trading, and consumption.</p>
        </div>

        <div className="aan-q-block">
          <h3 className="aan-question">Technology, Compliance, and Market Structure</h3>
          <p><strong>Q: What role is technology playing in the gold industry?</strong></p>
          <p>Technology is improving efficiency across trading, logistics, and documentation. Digital platforms are reducing friction, improving price discovery, and supporting more integrated and resilient market structures.</p>
          <p>At the same time, compliance and risk management have become central priorities. Greater emphasis on due diligence, counterparty risk, and diversified sourcing has improved resilience, even as complexity has increased.</p>
        </div>

        <div className="aan-q-block">
          <h3 className="aan-question">Geopolitics, Risk, and Market Volatility</h3>
          <p><strong>Q: How do geopolitical developments influence the gold market?</strong></p>
          <p>Geopolitical risks continue to shape investor behaviour. Periods of heightened global tension often trigger increased demand for safe-haven assets, with gold benefiting from this shift.</p>
          <p>Trade policies, sanctions, and regulatory changes have altered traditional supply routes, requiring participants to remain flexible and adaptive.</p>
        </div>

        <div className="aan-q-block">
          <h3 className="aan-question">Outlook for Gold</h3>
          <p><strong>Q: What is the outlook for gold in the near to long term?</strong></p>
          <p>In the near term, gold is likely to remain in a consolidation phase, with prices responding to interest rate expectations, liquidity conditions, and geopolitical signals. Sharp rallies may be limited, but downside risks are cushioned by steady underlying demand.</p>
          <p>Over the long term, gold’s outlook remains cautiously positive. Structural drivers such as central bank accumulation, long-term investment demand, and enduring consumer trust continue to support gold’s relevance as a strategic asset in a changing global economy.</p>
        </div>

        {/* Closing Perspective - Boxed */}
        <div className="aan-closing-box">
          <h4 className="aan-callout-title">Closing Perspective</h4>
          <p>
          Gold’s enduring relevance lies in its ability to adapt while retaining its core identity as a store of value. Across monetary cycles, geopolitical shifts, and evolving investor behaviour, gold continues to serve as a stabilising force.
          </p>
        </div>

        <footer className="aan-article-footer">
          <div className="aan-series-nav">
            <h4>In This Series</h4>
            <p>Part 1: Gold Rush — Myth & Reality</p>
            <p style={{color: '#999'}}>Part 2: Coming Soon</p>
          </div>
          <p style={{fontSize: '13px', marginTop: '20px', fontStyle: 'italic', color: '#555'}}>
            <strong>Editor’s Note:</strong> This interview is compiled and edited from a series of in-depth conversations with a senior industry expert. The views expressed are for information and analysis and do not constitute investment advice.
          </p>
        </footer>
      </article>
    </main>
  );
}