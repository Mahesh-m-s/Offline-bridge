import React from 'react';
import { Phone, ShieldAlert } from 'lucide-react';

const contacts = [
  ['Emergency response', '112', 'National emergency assistance'],
  ['Women’s support', '181', 'Women in distress'],
  ['Child support', '1098', 'Child protection services'],
  ['Farmer information', '1800-180-1551', 'Kisan call centre']
];
export default function Helpline() {
  return <section className="portal-page"><p className="eyebrow">Help and support</p><h1>Helpline numbers</h1>
    <p className="lead">For urgent help, call the relevant service directly. Numbers are displayed as provided by their public service listings.</p>
    <div className="helpline-list">{contacts.map(([name, number, details]) => <article key={number}>
      <Phone/><div><h2>{name}</h2><p>{details}</p></div><a href={`tel:${number.replaceAll('-', '')}`} aria-label={`Call ${name} ${number}`}>{number}</a>
    </article>)}</div>
    <p className="ob-banner ob-banner--info"><ShieldAlert/> For health emergencies, contact local emergency services or visit the nearest health centre.</p>
  </section>;
}
