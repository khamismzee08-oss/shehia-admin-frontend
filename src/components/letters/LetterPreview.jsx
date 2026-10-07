import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

// Renders the letter's full, self-contained HTML document inside an
// iframe (via srcDoc) instead of dangerouslySetInnerHTML-ing it into
// the page.
//
// Why: the letter HTML is a whole document with its own <style> block
// (fonts, page size, etc). Injecting that directly into the admin
// dashboard's DOM leaks those rules onto the entire app - notably a
// `* { margin:0; padding:0; font-family: "Times New Roman" }` reset
// that would otherwise apply everywhere. An iframe keeps the letter's
// styling fully scoped to itself, and - as a bonus - renders using the
// same normal CSS whitespace rules the PDF renderer uses, so the
// preview now matches the PDF's line spacing instead of the old
// "letter looks way too tall" effect.
//
// sandbox="allow-same-origin" (without "allow-scripts") lets us read
// and write the iframe's contentDocument from here for the edit
// feature, while still refusing to execute any script tag that might
// end up in the letter content.
const LetterPreview = forwardRef(function LetterPreview({ html, editable = false }, ref) {
  const iframeRef = useRef(null);
  const [height, setHeight] = useState(400);

  const resize = () => {
    const doc = iframeRef.current?.contentDocument;
    if (doc?.documentElement) {
      setHeight(Math.max(400, doc.documentElement.scrollHeight + 24));
    }
  };

  const applyEditable = () => {
    const doc = iframeRef.current?.contentDocument;
    if (doc?.body) doc.body.setAttribute("contenteditable", editable ? "true" : "false");
  };

  const handleLoad = () => {
    applyEditable();
    resize();
    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      doc.removeEventListener("input", resize);
      doc.addEventListener("input", resize);
    }
  };

  useEffect(() => {
    applyEditable();
  }, [editable]);

  useImperativeHandle(ref, () => ({
    // Pulls the current (possibly hand-edited) HTML out of the iframe,
    // as a full standalone document so it can be saved and later fed
    // straight back into the PDF renderer unchanged.
    getHtml: () => {
      const doc = iframeRef.current?.contentDocument;
      if (!doc?.documentElement) return null;
      return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
    }
  }));

  return (
    <div className="letter-paper">
      <iframe
        key={editable ? "edit" : "view"}
        ref={iframeRef}
        title="Letter preview"
        srcDoc={html || "<p>No preview returned by the API.</p>"}
        onLoad={handleLoad}
        sandbox="allow-same-origin"
        style={{ width: "100%", height, border: 0, display: "block", background: "#fff" }}
      />
    </div>
  );
});

export default LetterPreview;
