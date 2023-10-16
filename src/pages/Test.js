import React, { useState } from 'react';
import { Tooltip } from 'reactstrap';

function Test(props) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const toggle = () => setTooltipOpen(!tooltipOpen);

  return (
    <div>
      <p>
        Sometimes you need to allow users to select text within a{' '}
        <span
          style={{ textDecoration: 'underline', color: 'blue' }}
          href="#"
          id="DisabledAutoHideExample"
        >
          tooltip
        </span>
        .
      </p>
      <Tooltip
        placement="left"
        isOpen={tooltipOpen}
        autohide={false}
        target="DisabledAutoHideExample"
        toggle={toggle}
      >
        Try to select this text!
      </Tooltip>
    </div>
  );
}

export default Test;