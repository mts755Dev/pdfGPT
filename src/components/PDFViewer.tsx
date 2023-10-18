"use client";
import React, { useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { MinusCircle, PlusCircle, RotateCcw } from "lucide-react";
import { toast } from "react-hot-toast";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

type Props = { pdf_url: string; pdf_name: string };

const MyPDFViewer = ({ pdf_url, pdf_name }: Props) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      const handleScroll = () => {
        const scrollPosition = container.scrollTop;
        const pageHeight = container.scrollHeight / numPages;
        const newPageNumber = Math.floor(scrollPosition / pageHeight) + 1;

        if (newPageNumber !== pageNumber) {
          setPageNumber(newPageNumber);
        }
      };

      container.addEventListener("scroll", handleScroll);

      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [numPages, pageNumber]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const goToPage = () => {
    const inputPage = pageInputRef.current?.value;
    if (inputPage && !isNaN(parseInt(inputPage))) {
      const page = parseInt(inputPage);
      if (page >= 1 && page <= numPages) {
        setPageNumber(page);
        containerRef.current?.scrollTo(
          0,
          (page - 1) * (containerRef.current?.scrollHeight / numPages)
        );
      }
    }
  };

  const handlePageInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      goToPage();
    }
  };

  const zoomIn = () => {
    setScale(scale + 0.2);
  };

  const zoomOut = () => {
    setScale(scale - 0.2);
  };

  const resetZoom = () => {
    setScale(1.2);
  };

  if (scale > 1.6) {
    toast.error("Max zoom in limit.");
    setScale(1.6);
  } else if (scale < 0.8) {
    setScale(0.8);
    toast.error("Max zoom out limit.");
  }

  return (
    <div className="h-screen">
      <header className="bg-white border-2 text-gray-900 px-4 flex justify-between items-center">
        <div className="text-lg font-bold">{pdf_name}</div>
        <div className="text-lg flex items-center space-x-2">
          <button onClick={zoomIn} title="Zoom In">
            <PlusCircle />
          </button>
          <button onClick={zoomOut} title="Zoom Out">
            <MinusCircle />
          </button>
          <button onClick={resetZoom} title="Reset Zoom">
            <RotateCcw />
          </button>
          <input
            type="text"
            ref={pageInputRef}
            value={pageNumber}
            onChange={(e) => {
              setPageNumber(parseInt(e.target.value) || 1);
            }}
            onKeyPress={handlePageInputKeyPress}
            style={{ width: "20px", height: "20px" }}
          />
          <span> / {numPages}</span>
        </div>
      </header>
      <div className="h-full overflow-y-auto" ref={containerRef}>
        <Document file={pdf_url} onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from({ length: numPages }, (_, index) => (
            <Page
              key={`page-${index + 1}`}
              pageNumber={index + 1}
              scale={scale}
            />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default MyPDFViewer;
