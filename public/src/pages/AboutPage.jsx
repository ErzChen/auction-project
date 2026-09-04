import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import './about-page.css';
import '../themes.css';
import TopBar from '../components/TopBar';

export function AboutPage() {
	return (
        <>
            <TopBar />
            <section className='about-page'>
                <div className='about-body'>
                    <h1>About Erz's Auction</h1>

                    <div className='about-block'>
                        <h2>Lorem ipsum</h2>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla congue, quam eu blandit vestibulum, mi tortor vehicula magna, sit amet ornare lectus mauris sit amet augue. Aliquam elementum nunc et turpis convallis commodo id eget turpis. In vitae aliquet purus, sit amet fringilla odio. Duis dictum vulputate tellus id porttitor. Phasellus est eros, ornare tincidunt quam quis, placerat consequat ante. Nam tincidunt rutrum sem ut venenatis. Nulla dignissim quis velit et fermentum. Nullam finibus nisl vitae dolor gravida semper. Nullam tellus sem, luctus quis ligula non, molestie posuere neque. Aenean et eleifend purus, eget efficitur velit. Mauris eget mauris eget magna sodales mattis. Donec dignissim vel ante a pellentesque. Phasellus vel sem ac ligula aliquam facilisis tempor sit amet nisi. Donec dictum sollicitudin nisi eget egestas.
                        </p>
                    </div>

                    <div className='about-block'>
                        <h2>Lorem ipsum</h2>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla congue, quam eu blandit vestibulum, mi tortor vehicula magna, sit amet ornare lectus mauris sit amet augue. Aliquam elementum nunc et turpis convallis commodo id eget turpis. 
                        </p>
                    </div>

                    <div className='about-block'>
                        <h2>Lorem ipsum</h2>
                        <ul className='about-list'>
                            <li>
                                <strong>Lorem ipsum</strong> — Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                            </li>
                            <li>
                                <strong>Lorem ipsum</strong> — Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                            </li>
                            <li>
                                <strong>Lorem ipsum</strong> — Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </>
	);
}

createRoot(document.getElementById('root')).render(
	<StrictMode>
        <BrowserRouter>
            <AboutPage />
        </BrowserRouter>
	</StrictMode>,
);