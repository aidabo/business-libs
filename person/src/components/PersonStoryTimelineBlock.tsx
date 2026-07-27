"use client";

import PersonStoryTimelinePreview from "./PersonStoryTimelinePreview";
import {
  buildPersonStoryStructureOutlineFromReference,
  getPersonStoryReferenceExamples,
  selectPersonStoryReferenceExample,
} from "../data/referenceExamples";

type PersonStoryTimelineBlockProps = {
  referenceId?: string;
  query?: string;
  compact?: boolean;
};

export default function PersonStoryTimelineBlock({
  referenceId = "yamada-sakura",
  query = "",
  compact = false,
}: PersonStoryTimelineBlockProps) {
  const references = getPersonStoryReferenceExamples();
  const reference =
    references.find((item) => item.id === referenceId) ||
    selectPersonStoryReferenceExample(query) ||
    references[0];
  const structureOutline = buildPersonStoryStructureOutlineFromReference(reference);

  return (
    <div className={compact ? "mx-auto max-w-5xl" : ""}>
      <PersonStoryTimelinePreview
        reference={reference}
        references={references}
        structureOutline={structureOutline}
      />
    </div>
  );
}
