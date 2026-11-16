zoom out before adding another implementation. prefer the existing helper, wrapper, or project when
it already owns the behavior. seek fewer independent implementations and concepts, not merely fewer
lines or helpers; trace ownership and affected callers before recommending consolidation.

similar syntax alone does not justify merging distinct behavior. compare a local fix with bounded
consolidation where overlap is real, and explain the concrete reduction in complexity. avoid
speculative frameworks and helpers with many switches. keep the comparison proportional to the task.
