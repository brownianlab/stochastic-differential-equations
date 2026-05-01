import React from 'react';
import clsx from 'clsx';
import './courseBoxes.css';

type BoxProps = { title?: string; children: React.ReactNode };

function Box({kind, title, children}: BoxProps & {kind: string}) {
  return (
    <section className={clsx('course-box', `course-box--${kind}`)}>
      {title && <div className="course-box__title">{title}</div>}
      <div className="course-box__body">{children}</div>
    </section>
  );
}

export const MotivationBox = (props: BoxProps) => <Box kind="motivation" {...props} />;
export const GeometryBox = (props: BoxProps) => <Box kind="geometry" {...props} />;
export const TheoremBox = (props: BoxProps) => <Box kind="theorem" {...props} />;
export const ProofBox = (props: BoxProps) => <Box kind="proof" {...props} />;
export const FinanceBox = (props: BoxProps) => <Box kind="finance" {...props} />;
export const ProblemBox = (props: BoxProps) => <Box kind="problem" {...props} />;
export const SolutionBox = (props: BoxProps) => <Box kind="solution" {...props} />;
export const WarningBox = (props: BoxProps) => <Box kind="warning" {...props} />;
