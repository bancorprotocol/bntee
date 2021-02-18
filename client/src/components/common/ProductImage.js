import React, { Component } from 'react';
import ReactImageMagnify from 'react-image-magnify';
import ReactSlick from 'react-slick';
import "slick-carousel/slick/slick.css";

import "slick-carousel/slick/slick-theme.css";
import './react-slick.css';

export default class ProductImage extends Component {
    render() {
        const { currentProduct } = this.props;
        const frontSrcSet = [
            { src: currentProduct.productFrontImageSmall, setting: '500w' },
            { src: currentProduct.productFrontImageLarge, setting: '1200w' },
        ]
            .map(item => `${item.src} ${item.setting}`)
            .join(', ');
        
        const backSrcSet = [
            { src: currentProduct.productBackImageSmall, setting: '500w' },
            { src: currentProduct.productBackImageLarge, setting: '1200w' },
        ]
            .map(item => `${item.src} ${item.setting}`)
            .join(', ');
        
        const dataSource = [
            {
                srcSet: frontSrcSet,
                small: currentProduct.productFrontImageSmall,
                large: currentProduct.productFrontImageLarge
            },
            {
                srcSet: backSrcSet,
                small: currentProduct.productBackImageSmall,
                large: currentProduct.productBackImageLarge
            }
        ];

        const  rimProps = {
                            isHintEnabled: false,
                            shouldHideHintAfterFirstActivation: true,
                            enlargedImagePosition: 'over',
                        }
        const {rsProps} = this.props;
  
        return (
            <ReactSlick
                {...{
                    dots: true,
                    infinite: true,
                    speed: 500,
                    slidesToShow: 1,
                    slidesToScroll: 1
                }}
                {...rsProps}
            >
                {dataSource.map((src, index) => (
                    <div key={index} className="image-magnify-source">
                        <ReactImageMagnify
                            {...{
                            smallImage: {
                                alt: 'BNTee product',
                                isFluidWidth: true,
                                src: src.small,
                                srcSet: src.srcSet,
                           
                            },
                            largeImage: {
                                src: src.large,
                                width: 1000,
                                height: 1046
                            },
                            enlargedImageContainerClassName: 'enlarged-image-container',
                            enlargedImageContainerDimensions: {
                                width: '170%',

                            },
                            lensStyle: { backgroundColor: 'rgba(0,0,0,.6)' },
                            }}
                            {...rimProps}
                        />
                    </div>
                ))}
            </ReactSlick>
        );
    }
}